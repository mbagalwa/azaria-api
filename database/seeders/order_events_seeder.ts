import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Order from '#models/order'
import OrderEvent from '#models/order_event'
import { DateTime } from 'luxon'

/**
 * Backfill de l'historique (timeline) des commandes existantes : reconstruit
 * un chemin d'événements plausible jusqu'au statut courant, horodaté en
 * remontant depuis l'heure de livraison (plafonné à maintenant). Idempotent :
 * ignore les commandes qui ont déjà des événements.
 */

/** Minutes AVANT l'heure de livraison pour chaque jalon. */
const OFFSET_MIN: Record<string, number> = {
  pending: 300,
  confirmed: 240,
  preparing: 90,
  ready: 30,
  delivering: 20,
  delivered: 0,
  picked_up: 0,
  cancelled: 210,
}

function pathFor(order: Order): string[] {
  if (order.status === 'cancelled') return ['pending', 'cancelled']
  const flow =
    order.mode === 'pickup'
      ? ['pending', 'confirmed', 'preparing', 'ready', 'picked_up']
      : ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered']
  const idx = flow.indexOf(order.status)
  return idx === -1 ? ['pending'] : flow.slice(0, idx + 1)
}

export default class extends BaseSeeder {
  async run() {
    const orders = await Order.query().preload('events')
    const now = DateTime.now()
    let touched = 0

    for (const order of orders) {
      if (order.events.length > 0) continue

      const [h, m] = order.deliveryTime.split(':').map(Number)
      const deliveryAt = order.deliveryDate.set({ hour: h, minute: m })

      let previous: DateTime | null = null
      for (const status of pathFor(order)) {
        let at = deliveryAt.minus({ minutes: OFFSET_MIN[status] ?? 0 })
        if (at > now) at = now
        if (previous && at <= previous) at = previous.plus({ minutes: 1 })
        previous = at
        await OrderEvent.create({ orderId: order.id, status, createdAt: at })
      }
      touched++
    }

    console.log(`→ Timeline : ${touched} commande(s) backfillée(s), ${orders.length - touched} déjà historisée(s).`)
  }
}
