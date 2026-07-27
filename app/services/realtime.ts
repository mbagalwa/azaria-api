import transmit from '@adonisjs/transmit/services/main'

/**
 * Diffusion temps réel (SSE) des signaux de commande. Les payloads restent
 * minimaux (code/statut) : les fronts re-fetchent la donnée réelle. Deux canaux :
 *  - `admin/orders`        → le back-office (nouvelles commandes + changements)
 *  - `orders/code/:code`   → la page de suivi du client
 *
 * Le canal client est indexé par le CODE de commande (et non plus par un id
 * utilisateur, qui n'existe plus) : c'est le secret que le client détient via
 * son lien de suivi, contrairement à un id séquentiel énumérable.
 */
export function notifyOrderCreated(order: {
  id: number
  code: string
  deliveryDate: string | null
}) {
  transmit.broadcast('admin/orders', {
    type: 'created',
    id: order.id,
    code: order.code,
    date: order.deliveryDate,
  })
}

export function notifyOrderUpdated(order: {
  id: number
  code: string
  status: string
  deliveryDate: string | null
}) {
  transmit.broadcast('admin/orders', {
    type: 'updated',
    id: order.id,
    status: order.status,
    date: order.deliveryDate,
  })
  transmit.broadcast(`orders/code/${order.code}`, {
    id: order.id,
    code: order.code,
    status: order.status,
  })
}

export function notifyPaymentUpdated(order: {
  id: number
  code: string
  paymentStatus: string
  deliveryDate: string | null
}) {
  transmit.broadcast('admin/orders', {
    type: 'updated',
    id: order.id,
    date: order.deliveryDate,
  })
  transmit.broadcast(`orders/code/${order.code}`, {
    id: order.id,
    code: order.code,
    paymentStatus: order.paymentStatus,
  })
}
