import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'program_dish_accompaniments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('program_dish_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('program_dishes')
        .onDelete('CASCADE')

      table
        .integer('accompaniment_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('accompaniments')
        .onDelete('CASCADE')

      /**
       * Prix FIGÉ du supplément dans ce programme — même principe que le prix
       * du plat : le catalogue peut bouger sans toucher aux programmes en cours.
       */
      table.integer('price_cents').unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['program_dish_id', 'accompaniment_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
