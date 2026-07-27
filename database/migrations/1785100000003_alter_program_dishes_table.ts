import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'program_dishes'

  /**
   * Règle métier resserrée : UN SEUL plat par jour dans un programme.
   *
   * On nettoie d'abord les programmes existants (on garde la 1re assignation de
   * chaque date, celle de plus petit id — c'est le plat que le client voyait en
   * tête de menu, prix figé compris), puis on remplace l'unicité
   * (program_id, scheduled_date, dish_id) par (program_id, scheduled_date).
   */
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(`
        DELETE FROM program_dishes pd
        USING program_dishes keep
        WHERE pd.program_id = keep.program_id
          AND pd.scheduled_date = keep.scheduled_date
          AND pd.id > keep.id
      `)
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['program_id', 'scheduled_date', 'dish_id'])
      table.unique(['program_id', 'scheduled_date'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['program_id', 'scheduled_date'])
      table.unique(['program_id', 'scheduled_date', 'dish_id'])
    })
  }
}
