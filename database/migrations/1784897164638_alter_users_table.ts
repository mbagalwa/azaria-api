import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /**
       * Numéro WhatsApp du client : identifiant de connexion côté app cliente
       * (normalisé sans espaces). Les comptes staff n'en ont pas. Postgres
       * autorise plusieurs NULL sur une contrainte unique.
       */
      table.string('phone').nullable().unique()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('phone')
    })
  }
}
