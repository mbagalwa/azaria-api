import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('order_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE')

      /** Statut atteint à cet instant (historique du cycle de la commande). */
      table.string('status').notNullable()

      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
