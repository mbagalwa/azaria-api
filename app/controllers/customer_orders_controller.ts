import Order from '#models/order'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import ProgramDish from '#models/program_dish'
import OrderDetailTransformer from '#transformers/order_detail_transformer'
import OrderSummaryTransformer from '#transformers/order_summary_transformer'
import { createCustomerOrderValidator } from '#validators/order'
import { generateUniqueOrderCode } from '#services/orders'
import { getSettings } from '#services/settings'
import { nowLocal, dayInBusinessTz, parseHmToMinutes } from '#services/clock'
import { notifyOrderCreated } from '#services/realtime'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

export default class CustomerOrdersController {
  /** Les commandes du client connecté (plus récentes d'abord). */
  async index(ctx: HttpContext) {
    const userId = ctx.auth.getUserOrFail().id
    const page = Math.max(1, Number(ctx.request.input('page', 1)) || 1)
    const limit = Math.min(100, Math.max(1, Number(ctx.request.input('limit', 20)) || 20))

    const paginator = await Order.query()
      .where('user_id', userId)
      .preload('customer')
      .preload('items')
      .preload('events')
      .orderBy('delivery_date', 'desc')
      .orderBy('delivery_time', 'desc')
      .paginate(page, limit)

    return ctx.serialize(
      OrderSummaryTransformer.paginate(paginator.all(), paginator.getMeta()),
    )
  }

  /** Détail d'une commande du client connecté. */
  async show(ctx: HttpContext) {
    const userId = ctx.auth.getUserOrFail().id
    const order = await Order.query()
      .where('id', ctx.params.id)
      .where('user_id', userId)
      .preload('customer')
      .preload('items')
      .preload('events')
      .first()
    if (!order) {
      throw new Exception('Commande introuvable.', { status: 404, code: 'E_NOT_FOUND' })
    }
    return ctx.serialize(OrderDetailTransformer.transform(order))
  }

  /** Passe une commande (panier d'un même jour). */
  async store(ctx: HttpContext) {
    const userId = ctx.auth.getUserOrFail().id
    const data = await ctx.request.validateUsing(createCustomerOrderValidator)
    const { restaurant } = await getSettings()

    // Toutes les décisions de temps se prennent dans le fuseau métier (UTC+2).
    const now = nowLocal()
    const delivery = dayInBusinessTz(data.deliveryDate)
    if (!delivery.isValid) {
      throw this.unprocessable('Date de livraison invalide.', 'E_INVALID_DATE')
    }
    if (delivery.startOf('day') < now.startOf('day')) {
      throw this.unprocessable('Cette date est déjà passée.', 'E_DATE_PAST')
    }

    const nowMinutes = now.hour * 60 + now.minute
    const cutoffMinutes = parseHmToMinutes(restaurant.orderCutoff) ?? 9 * 60
    if (delivery.hasSame(now, 'day') && nowMinutes >= cutoffMinutes) {
      throw this.unprocessable(
        `Les commandes du jour se ferment à ${restaurant.orderCutoff}. Choisissez une autre date.`,
        'E_CUTOFF',
      )
    }
    const deliveryMinutes = parseHmToMinutes(data.deliveryTime)
    if (delivery.hasSame(now, 'day') && deliveryMinutes !== null && deliveryMinutes <= nowMinutes) {
      throw this.unprocessable("L'heure de livraison choisie est déjà passée.", 'E_TIME_PAST')
    }
    if (data.mode === 'delivery' && !data.address?.trim()) {
      throw this.unprocessable('Le lieu de livraison est requis.', 'E_ADDRESS_REQUIRED')
    }

    /**
     * Menu du jour (prix figés) pour valider et facturer. Le tri par `id` est
     * IDENTIQUE à celui du MenuController : en cas de plat présent dans deux
     * programmes le même jour, on facture EXACTEMENT le prix affiché au client.
     */
    const menu = await ProgramDish.query()
      .where('scheduled_date', data.deliveryDate)
      .preload('dish')
      .orderBy('id', 'asc')
    const info = new Map<number, { name: string; priceCents: number; available: boolean }>()
    for (const pd of menu) {
      if (info.has(pd.dishId)) continue
      info.set(pd.dishId, {
        name: pd.dish.name,
        priceCents: pd.priceCents,
        available: pd.dish.isAvailable,
      })
    }

    /** Fusionne les quantités par plat. */
    const merged = new Map<number, number>()
    for (const it of data.items) merged.set(it.dishId, (merged.get(it.dishId) ?? 0) + it.quantity)

    const itemsData: { dishId: number; name: string; priceCents: number; quantity: number }[] = []
    for (const [dishId, quantity] of merged) {
      const dish = info.get(dishId)
      if (!dish || !dish.available) {
        throw this.unprocessable(
          'Un plat sélectionné n’est pas disponible ce jour-là.',
          'E_DISH_UNAVAILABLE',
        )
      }
      itemsData.push({ dishId, name: dish.name, priceCents: dish.priceCents, quantity })
    }
    const itemsTotal = itemsData.reduce((s, i) => s + i.priceCents * i.quantity, 0)
    const deliveryFeeCents = data.mode === 'delivery' ? restaurant.deliveryFeeCents : 0
    const totalCents = itemsTotal + deliveryFeeCents
    const code = await generateUniqueOrderCode()

    const order = await db.transaction(async (trx) => {
      const created = await Order.create(
        {
          code,
          userId,
          deliveryDate: delivery,
          deliveryTime: data.deliveryTime,
          mode: data.mode,
          address: data.mode === 'delivery' ? (data.address ?? null) : null,
          landmark: data.landmark ?? null,
          status: 'pending',
          paymentMethod: data.paymentMethod,
          paymentStatus: 'unpaid',
          deliveryFeeCents,
          totalCents,
          note: data.note ?? null,
        },
        { client: trx },
      )
      await OrderItem.createMany(
        itemsData.map((i) => ({ ...i, orderId: created.id })),
        { client: trx },
      )
      await OrderEvent.create({ orderId: created.id, status: 'pending' }, { client: trx })
      return created
    })

    notifyOrderCreated({
      id: order.id,
      code: order.code,
      deliveryDate: order.deliveryDate.toISODate(),
    })

    await order.load('customer')
    await order.load('items')
    await order.load('events')
    return ctx.serialize(OrderDetailTransformer.transform(order))
  }

  private unprocessable(message: string, code: string) {
    return new Exception(message, { status: 422, code })
  }
}
