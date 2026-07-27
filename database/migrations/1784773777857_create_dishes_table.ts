import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'dishes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table.string('name').notNullable()
      table.text('description').nullable()

      /** Prix unitaire en centimes de dollar (entier), jamais en flottant. */
      table.integer('price_cents').unsigned().notNullable()

      /** Catégorie en texte libre pour la V1 (normalisée en table plus tard). */
      table.string('category').nullable()

      /** Image hébergée sur Cloudinary : URL sécurisée + public_id pour la gestion. */
      table.string('image_url').nullable()
      table.string('image_public_id').nullable()

      /**
       * Interrupteur manuel disponible/épuisé (pas de quota chiffré en V1).
       */
      table.boolean('is_available').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
