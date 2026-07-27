import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      /** Clé du groupe de réglages (ex. `restaurant`, `notifications`). */
      table.string('key').notNullable().unique()

      /** Contenu du groupe en JSON sérialisé (texte), fusionné aux défauts. */
      table.text('value').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
