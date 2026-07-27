import Order from '#models/order'
import OrderEvent from '#models/order_event'
import OrderDetailTransformer from '#transformers/order_detail_transformer'
import OrderSummaryTransformer from '#transformers/order_summary_transformer'
import { notifyOrderUpdated, notifyPaymentUpdated } from '#services/realtime'
import { dispatchPaymentChanged, dispatchStatusChanged, queue } from '#services/notifications/index'
import { nowLocal, dayInBusinessTz, parseHmToMinutes } from '#services/clock'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Statuts terminaux « livrés » (une commande servie n'est jamais en retard). */
const SERVED = new Set(['delivered', 'picked_up'])

/** Cycle de statuts selon le mode. */
const FLOW: Record<string, string[]> = {
  delivery: ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'],
  pickup: ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'],
}

/** États finaux : plus aucune transition possible. */
const TERMINAL = new Set(['delivered', 'picked_up', 'cancelled'])

/** Transitions autorisées depuis l'état courant : l'étape suivante + annulation. */
function allowedTransitions(mode: string, current: string): string[] {
  if (TERMINAL.has(current)) return []
  const flow = FLOW[mode] ?? FLOW.delivery
  const idx = flow.indexOf(current)
  const next = idx >= 0 && idx < flow.length - 1 ? [flow[idx + 1]] : []
  return [...next, 'cancelled']
}

export default class OrdersController {
  /**
   * Liste paginée des commandes (`?page=&limit=`), filtrable par intervalle de
   * dates de livraison (`?from=&to=`, ISO) — utilisé par le calendrier hebdo.
   */
  async index(ctx: HttpContext) {
    this.ensureManager(ctx)
    const page = Math.max(1, Number(ctx.request.input('page', 1)) || 1)
    const limit = Math.min(200, Math.max(1, Number(ctx.request.input('limit', 20)) || 20))
    const from = String(ctx.request.input('from', '') ?? '')
    const to = String(ctx.request.input('to', '') ?? '')

    const query = Order.query()
      .preload('customer')
      .preload('items', (q) => q.preload('accompaniments'))
      .preload('events')
      .orderBy('delivery_date', 'asc')
      .orderBy('delivery_time', 'asc')

    if (ISO_DATE.test(from)) query.where('delivery_date', '>=', from)
    if (ISO_DATE.test(to)) query.where('delivery_date', '<=', to)

    const paginator = await query.paginate(page, limit)
    return ctx.serialize(OrderSummaryTransformer.paginate(paginator.all(), paginator.getMeta()))
  }

  /**
   * Agrégats pour le tableau de bord sur un intervalle (`?from=&to=`, ISO).
   * Calculé côté serveur pour ne PAS dépendre du plafond de pagination, et les
   * commandes annulées sont ISOLÉES (jamais comptées dans le CA, les modes, les
   * plats ou les retards). Les retards se calculent dans le fuseau métier.
   */
  async stats(ctx: HttpContext) {
    this.ensureManager(ctx)
    const from = String(ctx.request.input('from', '') ?? '')
    const to = String(ctx.request.input('to', '') ?? '')

    const query = Order.query().preload('items')
    if (ISO_DATE.test(from)) query.where('delivery_date', '>=', from)
    if (ISO_DATE.test(to)) query.where('delivery_date', '<=', to)
    const orders = await query

    const byStatus: Record<string, number> = {}
    const byMode: Record<string, number> = { delivery: 0, pickup: 0 }
    const dishMap = new Map<
      string,
      { dishId: number | null; name: string; quantity: number; revenueCents: number }
    >()
    const dailyMap = new Map<string, { grossCents: number; orders: number }>()
    let grossCents = 0
    let paidCents = 0
    let paidCount = 0
    let cancelledCount = 0
    let activeCount = 0
    let lateCount = 0
    const now = nowLocal()

    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1
      if (o.status === 'cancelled') {
        cancelledCount++
        continue
      }
      activeCount++
      byMode[o.mode] = (byMode[o.mode] ?? 0) + 1
      grossCents += o.totalCents
      if (o.paymentStatus === 'paid') {
        paidCents += o.totalCents
        paidCount++
      }
      const dayKey = o.deliveryDate?.toISODate()
      if (dayKey) {
        const d = dailyMap.get(dayKey) ?? { grossCents: 0, orders: 0 }
        d.grossCents += o.totalCents
        d.orders += 1
        dailyMap.set(dayKey, d)
      }
      for (const it of o.items) {
        const key = it.dishId !== null ? `dish:${it.dishId}` : `name:${it.name}`
        const cur = dishMap.get(key) ?? {
          dishId: it.dishId,
          name: it.name,
          quantity: 0,
          revenueCents: 0,
        }
        cur.quantity += it.quantity
        cur.revenueCents += it.priceCents * it.quantity
        dishMap.set(key, cur)
      }
      if (!SERVED.has(o.status)) {
        const iso = o.deliveryDate?.toISODate()
        const mins = parseHmToMinutes(o.deliveryTime)
        if (iso && mins !== null) {
          const deadline = dayInBusinessTz(iso).plus({ minutes: mins })
          if (deadline < now) lateCount++
        }
      }
    }

    const topDishes = [...dishMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 8)

    const daily = [...dailyMap.entries()]
      .map(([date, v]) => ({ date, grossCents: v.grossCents, orders: v.orders }))
      .sort((a, b) => (a.date < b.date ? -1 : 1))

    return {
      data: {
        range: { from: from || null, to: to || null },
        orders: { total: orders.length, active: activeCount, cancelled: cancelledCount },
        revenue: { grossCents, paidCents, unpaidCents: grossCents - paidCents },
        byStatus,
        byMode,
        daily,
        rates: {
          paymentRate: activeCount ? paidCount / activeCount : 0,
          cancellationRate: orders.length ? cancelledCount / orders.length : 0,
        },
        avgBasketCents: activeCount ? Math.round(grossCents / activeCount) : 0,
        lateCount,
        topDishes,
      },
    }
  }

  /** Détail d'une commande (lignes + client). */
  async show(ctx: HttpContext) {
    this.ensureManager(ctx)
    const order = await this.findLoaded(ctx.params.id)
    return ctx.serialize(OrderDetailTransformer.transform(order))
  }

  /**
   * Fait avancer le statut d'une commande dans sa suite logique (étape suivante
   * ou annulation) et journalise l'événement. Refuse les régressions/sauts.
   */
  async updateStatus(ctx: HttpContext) {
    this.ensureManager(ctx)
    const order = await this.findLoaded(ctx.params.id)

    const status = String(ctx.request.input('status', ''))
    const allowed = allowedTransitions(order.mode, order.status)
    if (!allowed.includes(status)) {
      throw new Exception(
        TERMINAL.has(order.status)
          ? 'Cette commande est terminée : son statut ne peut plus changer.'
          : 'Transition de statut non autorisée.',
        { status: 422, code: 'E_INVALID_TRANSITION' }
      )
    }

    order.status = status
    await order.save()
    await OrderEvent.create({ orderId: order.id, status })
    await order.load('events')
    notifyOrderUpdated({
      id: order.id,
      code: order.code,
      status: order.status,
      deliveryDate: order.deliveryDate.toISODate(),
    })
    /** Le client n'a pas de compte : WhatsApp est son seul canal de suivi. */
    queue(() => dispatchStatusChanged(order))

    return ctx.serialize(OrderSummaryTransformer.transform(order))
  }

  /** Marque le paiement d'une commande (payé / non payé). */
  async updatePayment(ctx: HttpContext) {
    this.ensureManager(ctx)
    const order = await this.findLoaded(ctx.params.id)

    const paymentStatus = String(ctx.request.input('paymentStatus', ''))
    if (paymentStatus !== 'paid' && paymentStatus !== 'unpaid') {
      throw new Exception('Statut de paiement invalide.', {
        status: 422,
        code: 'E_INVALID_PAYMENT',
      })
    }
    // Une commande annulée ne peut pas être encaissée : incohérence comptable.
    if (order.status === 'cancelled' && paymentStatus === 'paid') {
      throw new Exception('Impossible de marquer payée une commande annulée.', {
        status: 422,
        code: 'E_PAYMENT_ON_CANCELLED',
      })
    }

    if (paymentStatus !== order.paymentStatus) {
      order.paymentStatus = paymentStatus
      await order.save()
      notifyPaymentUpdated({
        id: order.id,
        code: order.code,
        paymentStatus,
        deliveryDate: order.deliveryDate.toISODate(),
      })
      queue(() => dispatchPaymentChanged(order))
    }

    return ctx.serialize(OrderSummaryTransformer.transform(order))
  }

  private async findLoaded(id: number | string): Promise<Order> {
    const order = await Order.query()
      .where('id', id)
      .preload('customer')
      .preload('items', (q) => q.preload('accompaniments'))
      .preload('events')
      .first()
    if (!order) {
      throw new Exception('Commande introuvable.', { status: 404, code: 'E_NOT_FOUND' })
    }
    return order
  }

  private ensureManager({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'manager') {
      throw new Exception("Action réservée à l'administration.", {
        status: 403,
        code: 'E_FORBIDDEN',
      })
    }
  }
}
