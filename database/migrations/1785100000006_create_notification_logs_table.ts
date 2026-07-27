import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification_logs'

  /**
   * Journal des messages sortants (WhatsApp / Telegram). Sans ça, un accusé de
   * réception non reçu est indébuggable : on ne saurait pas si l'API a été
   * appelée, ce qu'elle a répondu, ni vers quel numéro.
   */
  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('order_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('orders')
        .onDelete('SET NULL')

      /** whatsapp | telegram */
      table.string('channel', 20).notNullable()
      /** order_received | status_change | payment_change | admin_new_order */
      table.string('kind', 40).notNullable()
      /** Numéro E.164 ou chat_id Telegram. */
      table.string('recipient').notNullable()
      table.text('body').nullable()
      /** sent | failed | skipped (canal désactivé ou non configuré) */
      table.string('status', 20).notNullable()
      /** Identifiant renvoyé par le fournisseur (wamid…), utile au support. */
      table.string('provider_message_id').nullable()
      table.text('error').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['order_id'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
