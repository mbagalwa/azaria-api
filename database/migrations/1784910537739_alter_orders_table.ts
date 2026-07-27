import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /** Frais de livraison figés (centimes USD), 0 pour un retrait. */
      table.integer('delivery_fee_cents').unsigned().notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('delivery_fee_cents')
    })
  }
}
