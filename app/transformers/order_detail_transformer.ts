import type Order from '#models/order'
import { BaseTransformer } from '@adonisjs/core/transformers'

/** Forme « détail » d'une commande : lignes (prix figés) + note. */
export default class OrderDetailTransformer extends BaseTransformer<Order> {
  toObject() {
    const o = this.resource
    return {
      id: o.id,
      code: o.code,
      deliveryDate: o.deliveryDate.toISODate(),
      deliveryTime: o.deliveryTime,
      mode: o.mode,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      totalCents: o.totalCents,
      deliveryFeeCents: o.deliveryFeeCents,
      address: o.address,
      landmark: o.landmark,
      note: o.note,
      customer: {
        id: o.customer.id,
        fullName: o.customer.fullName,
        email: o.customer.email,
        initials: o.customer.initials,
      },
      items: (o.items ?? []).map((i) => ({
        id: i.id,
        dishId: i.dishId,
        name: i.name,
        priceCents: i.priceCents,
        quantity: i.quantity,
      })),
      itemsCount: (o.items ?? []).reduce((sum, i) => sum + i.quantity, 0),
      events: (o.events ?? [])
        .slice()
        .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
        .map((e) => ({ id: e.id, status: e.status, createdAt: e.createdAt.toISO() })),
      createdAt: o.createdAt.toISO(),
    }
  }
}
