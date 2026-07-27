import transmit from '@adonisjs/transmit/services/main'

/**
 * Diffusion temps réel (SSE) des signaux de commande. Les payloads restent
 * minimaux (ids/statuts) : les fronts re-fetchent la donnée réelle via leurs
 * routes authentifiées. Deux canaux :
 *  - `admin/orders`      → le back-office (nouvelles commandes + changements)
 *  - `orders/user/:id`   → l'app cliente (statut de SES commandes)
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
  userId: number
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
  transmit.broadcast(`orders/user/${order.userId}`, {
    id: order.id,
    code: order.code,
    status: order.status,
  })
}

export function notifyPaymentUpdated(order: {
  id: number
  userId: number
  code: string
  paymentStatus: string
  deliveryDate: string | null
}) {
  transmit.broadcast('admin/orders', {
    type: 'updated',
    id: order.id,
    date: order.deliveryDate,
  })
  transmit.broadcast(`orders/user/${order.userId}`, {
    id: order.id,
    code: order.code,
    paymentStatus: order.paymentStatus,
  })
}
