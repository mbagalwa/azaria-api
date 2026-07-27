import Order from '#models/order'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import OrderItemAccompaniment from '#models/order_item_accompaniment'
import OrderDetailTransformer from '#transformers/order_detail_transformer'
import { createPublicOrderValidator } from '#validators/public_order'
import { menuForDate } from '#services/menu'
import { generateUniqueOrderCode } from '#services/orders'
import { getSettings } from '#services/settings'
import { normalizePhone } from '#services/phone'
import { nowLocal, dayInBusinessTz, parseHmToMinutes } from '#services/clock'
import { notifyOrderCreated } from '#services/realtime'
import { dispatchOrderCreated, queue } from '#services/notifications/index'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

/** Fenêtre pendant laquelle une soumission identique est traitée comme un doublon. */
const DUPLICATE_WINDOW_MINUTES = 2

/**
 * Commande PUBLIQUE, sans compte. Le client remplit un formulaire (nom, numéro
 * WhatsApp, lieu) et reçoit un accusé de réception sur WhatsApp ; l'équipe est
 * alertée dans la foulée. Le suivi se fait ensuite par le code de commande.
 */
export default class PublicOrdersController {
  /** Suivi d'une commande par son code (le lien envoyé au client). */
  async show(ctx: HttpContext) {
    const code = String(ctx.params.code ?? '').toUpperCase()
    const order = await Order.query()
      .where('code', code)
      .preload('items', (q) => q.preload('accompaniments'))
      .preload('events')
      .first()

    if (!order) {
      throw new Exception('Commande introuvable.', { status: 404, code: 'E_NOT_FOUND' })
    }
    return ctx.serialize(OrderDetailTransformer.transform(order))
  }

  /** Enregistre une commande passée depuis la vitrine. */
  async store(ctx: HttpContext) {
    const data = await ctx.request.validateUsing(createPublicOrderValidator)
    const { restaurant } = await getSettings()

    const phone = normalizePhone(data.phone)
    if (!phone) {
      throw this.unprocessable(
        'Numéro WhatsApp invalide. Exemple : 099 123 45 67.',
        'E_INVALID_PHONE'
      )
    }

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
        'E_CUTOFF'
      )
    }
    const deliveryMinutes = parseHmToMinutes(data.deliveryTime)
    if (delivery.hasSame(now, 'day') && deliveryMinutes !== null && deliveryMinutes <= nowMinutes) {
      throw this.unprocessable("L'heure choisie est déjà passée.", 'E_TIME_PAST')
    }
    if (data.mode === 'delivery' && !data.address?.trim()) {
      throw this.unprocessable('Le lieu de livraison est requis.', 'E_ADDRESS_REQUIRED')
    }

    /**
     * Le plat n'est pas transmis par le client : un seul est au menu ce jour-là,
     * le serveur le résout — et facture EXACTEMENT le prix affiché (même tri).
     */
    const dish = await menuForDate(data.deliveryDate)
    if (!dish) {
      throw this.unprocessable("Aucun plat n'est au menu pour cette date.", 'E_NO_DISH_FOR_DATE')
    }

    /** Les accompagnements doivent faire partie de ceux proposés avec ce plat. */
    const offered = new Map(dish.accompaniments.map((a) => [a.id, a]))
    const chosen = [...new Set(data.accompanimentIds ?? [])].map((id) => {
      const found = offered.get(id)
      if (!found) {
        throw this.unprocessable(
          "Un accompagnement choisi n'est pas proposé avec ce plat.",
          'E_ACCOMPANIMENT_UNAVAILABLE'
        )
      }
      return found
    })

    /** Les suppléments sont facturés par assiette, donc multipliés par la quantité. */
    const extrasCents = chosen.reduce((sum, a) => sum + a.priceCents, 0)
    const unitCents = dish.priceCents + extrasCents
    const deliveryFeeCents = data.mode === 'delivery' ? restaurant.deliveryFeeCents : 0
    const totalCents = unitCents * data.quantity + deliveryFeeCents

    const duplicate = await this.findRecentDuplicate(phone, data.deliveryDate, data.deliveryTime)
    if (duplicate) return ctx.serialize(OrderDetailTransformer.transform(duplicate))

    const code = await generateUniqueOrderCode()
    const order = await db.transaction(async (trx) => {
      const created = await Order.create(
        {
          code,
          userId: null,
          customerName: data.fullName,
          customerPhone: phone,
          deliveryDate: delivery,
          deliveryTime: data.deliveryTime,
          mode: data.mode,
          address: data.mode === 'delivery' ? (data.address ?? null) : null,
          landmark: data.landmark ?? null,
          status: 'pending',
          /** Paiement à la livraison : seul mode ouvert au client pour l'instant. */
          paymentMethod: 'cash_on_delivery',
          paymentStatus: 'unpaid',
          deliveryFeeCents,
          totalCents,
          note: data.note ?? null,
        },
        { client: trx }
      )

      const item = await OrderItem.create(
        {
          orderId: created.id,
          dishId: dish.dishId,
          name: dish.name,
          priceCents: dish.priceCents,
          quantity: data.quantity,
        },
        { client: trx }
      )

      if (chosen.length) {
        await OrderItemAccompaniment.createMany(
          chosen.map((a) => ({
            orderItemId: item.id,
            accompanimentId: a.id,
            name: a.name,
            priceCents: a.priceCents,
          })),
          { client: trx }
        )
      }

      await OrderEvent.create({ orderId: created.id, status: 'pending' }, { client: trx })
      return created
    })

    await order.load('items', (q) => q.preload('accompaniments'))
    await order.load('events')

    notifyOrderCreated({
      id: order.id,
      code: order.code,
      deliveryDate: order.deliveryDate.toISODate(),
    })
    /** Accusé WhatsApp au client + alerte équipe : en arrière-plan, jamais bloquant. */
    queue(() => dispatchOrderCreated(order))

    ctx.response.status(201)
    return ctx.serialize(OrderDetailTransformer.transform(order))
  }

  /**
   * Un double-clic (ou un rechargement) ne doit pas créer deux commandes : on
   * renvoie la commande identique enregistrée il y a moins de deux minutes.
   */
  private async findRecentDuplicate(
    phone: string,
    deliveryDate: string,
    deliveryTime: string
  ): Promise<Order | null> {
    const since = nowLocal().minus({ minutes: DUPLICATE_WINDOW_MINUTES }).toSQL({
      includeOffset: false,
    })
    if (!since) return null

    return Order.query()
      .where('customer_phone', phone)
      .where('delivery_date', deliveryDate)
      .where('delivery_time', deliveryTime)
      .where('created_at', '>=', since)
      .preload('items', (q) => q.preload('accompaniments'))
      .preload('events')
      .orderBy('id', 'desc')
      .first()
  }

  private unprocessable(message: string, code: string) {
    return new Exception(message, { status: 422, code })
  }
}
