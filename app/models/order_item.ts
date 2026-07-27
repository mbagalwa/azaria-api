import { OrderItemSchema } from '#database/schema'
import OrderItemAccompaniment from '#models/order_item_accompaniment'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

/** Une ligne de commande (nom + prix figés au moment de la commande). */
export default class OrderItem extends OrderItemSchema {
  @hasMany(() => OrderItemAccompaniment, { foreignKey: 'orderItemId' })
  declare accompaniments: HasMany<typeof OrderItemAccompaniment>
}
