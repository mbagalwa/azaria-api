import { OrderSchema } from '#database/schema'
import OrderEvent from '#models/order_event'
import OrderItem from '#models/order_item'
import User from '#models/user'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

/**
 * Une commande client : livraison/retrait à une date + heure, lignes en prix
 * figés (prix du programme au moment de la commande).
 */
export default class Order extends OrderSchema {
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare customer: BelongsTo<typeof User>

  @hasMany(() => OrderItem, { foreignKey: 'orderId' })
  declare items: HasMany<typeof OrderItem>

  @hasMany(() => OrderEvent, { foreignKey: 'orderId' })
  declare events: HasMany<typeof OrderEvent>
}
