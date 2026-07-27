import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'programs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      /** Code/hash unique du programme (aussi utilisé comme seed du cover). */
      table.string('code').notNullable().unique()

      table.string('title').nullable()
      table.text('description').nullable()

      /** Intervalle couvert par le programme. */
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
