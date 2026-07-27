import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      /** Référence lisible de la commande (ex. ORD-7K2QD9). */
      table.string('code').notNullable().unique()

      /** Le client (users.role = customer). */
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      /** Livraison : date + heure libre (HH:MM) choisie par le client. */
      table.date('delivery_date').notNullable()
      table.string('delivery_time', 5).notNullable()

      /** Mode : livraison ou retrait sur place. */
      table.string('mode').notNullable().defaultTo('delivery')
      table.string('address').nullable()

      /**
       * Cycle complet : pending → confirmed → preparing → ready →
       * (delivery: delivering → delivered | pickup: picked_up) + cancelled.
       */
      table.string('status').notNullable().defaultTo('pending')

      /** Paiement : à la livraison ou Mobile Money ; unpaid | paid. */
      table.string('payment_method').notNullable().defaultTo('cash_on_delivery')
      table.string('payment_status').notNullable().defaultTo('unpaid')

      /** Total figé en centimes USD (somme des lignes). */
      table.integer('total_cents').unsigned().notNullable().defaultTo(0)

      table.text('note').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
