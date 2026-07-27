import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'program_dishes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('program_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('programs')
        .onDelete('CASCADE')

      table
        .integer('dish_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('dishes')
        .onDelete('CASCADE')

      /** Date programmée (dans l'intervalle du programme). */
      table.date('scheduled_date').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      /** Un plat ne peut apparaître qu'une fois par date dans un programme. */
      table.unique(['program_id', 'scheduled_date', 'dish_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
