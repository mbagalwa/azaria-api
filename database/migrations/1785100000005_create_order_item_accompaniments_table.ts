import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_item_accompaniments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('order_item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('order_items')
        .onDelete('CASCADE')

      /**
       * SET NULL + snapshots `name`/`price_cents` : la commande garde son
       * libellé et son prix même si l'accompagnement disparaît du catalogue.
       */
      table
        .integer('accompaniment_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('accompaniments')
        .onDelete('SET NULL')

      table.string('name').notNullable()
      table.integer('price_cents').unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
