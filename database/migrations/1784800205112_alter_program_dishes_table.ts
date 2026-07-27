import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'program_dishes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      /**
       * Prix FIGÉ au moment de la programmation (centimes USD). C'est ce prix
       * qui s'affiche sur le programme et que le client paiera — indépendant
       * des changements ultérieurs du prix catalogue du plat.
       */
      table.integer('price_cents').unsigned().notNullable().defaultTo(0)
    })

    /** Backfill des entrées existantes avec le prix catalogue actuel. */
    this.defer(async (db) => {
      await db.rawQuery(
        'update program_dishes set price_cents = dishes.price_cents from dishes where dishes.id = program_dishes.dish_id'
      )
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('price_cents')
    })
  }
}
