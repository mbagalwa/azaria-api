import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accompaniments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('name').notNullable()
      table.text('description').nullable()

      /**
       * Supplément en centimes USD. 0 = inclus dans le prix du plat (cas le
       * plus courant) ; > 0 = s'ajoute au total de la ligne de commande.
       */
      table.integer('price_cents').unsigned().notNullable().defaultTo(0)

      table.string('image_url').nullable()
      table.string('image_public_id').nullable()

      /** Interrupteur manuel dispo/épuisé, comme pour les plats. */
      table.boolean('is_available').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
