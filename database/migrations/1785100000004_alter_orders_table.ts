import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  /**
   * Commande SANS COMPTE : le client s'identifie par son nom + son numéro
   * WhatsApp saisis dans le formulaire, plus par un compte utilisateur.
   *
   *  - `user_id` devient nullable et passe en SET NULL (l'historique survit à
   *    la suppression d'un ancien compte client) ;
   *  - `customer_name` / `customer_phone` portent l'identité du commanditaire,
   *    backfillées depuis `users` pour les commandes déjà en base ;
   *  - `customer_phone` est au format E.164 (+243…) : c'est la clé d'envoi
   *    WhatsApp et de regroupement des commandes d'un même client.
   */
  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('customer_name').nullable()
      table.string('customer_phone', 24).nullable()
      table.index(['customer_phone'])
    })

    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE orders o
        SET customer_name = u.full_name,
            customer_phone = COALESCE(u.phone, '')
        FROM users u
        WHERE o.user_id = u.id AND o.customer_name IS NULL
      `)
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['user_id'])
      table.integer('user_id').unsigned().nullable().alter()
      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['customer_phone'])
      table.dropColumn('customer_name')
      table.dropColumn('customer_phone')
    })
  }
}
