import type Order from '#models/order'
import { orderCustomer, orderEvents, orderItems } from '#transformers/order_customer'
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
      customer: orderCustomer(o),
      items: orderItems(o),
      itemsCount: (o.items ?? []).reduce((sum, i) => sum + i.quantity, 0),
      events: orderEvents(o),
      createdAt: o.createdAt.toISO(),
    }
  }
}
