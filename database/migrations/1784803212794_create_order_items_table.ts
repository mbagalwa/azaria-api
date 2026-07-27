import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

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

      /**
       * Référence au plat, mais l'historique survit à sa suppression grâce aux
       * snapshots `name` + `price_cents` (prix du PROGRAMME au moment de la
       * commande, jamais le catalogue).
       */
      table
        .integer('dish_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('dishes')
        .onDelete('SET NULL')

      table.string('name').notNullable()
      table.integer('price_cents').unsigned().notNullable()
      table.integer('quantity').unsigned().notNullable().defaultTo(1)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
