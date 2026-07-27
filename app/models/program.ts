import { ProgramSchema } from '#database/schema'
import ProgramDish from '#models/program_dish'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

/**
 * Un programme = un menu-calendrier sur un intervalle de dates. Ses `entries`
 * associent des plats à des dates précises (plusieurs plats/date, sans doublon).
 */
export default class Program extends ProgramSchema {
  @hasMany(() => ProgramDish, { foreignKey: 'programId' })
  declare entries: HasMany<typeof ProgramDish>
}
