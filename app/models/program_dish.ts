import { ProgramDishSchema } from '#database/schema'
import Dish from '#models/dish'
import ProgramDishAccompaniment from '#models/program_dish_accompaniment'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

/**
 * LE plat du jour d'un programme (un seul par date, cf. l'unicité
 * program_id + scheduled_date), avec les accompagnements proposés avec lui.
 */
export default class ProgramDish extends ProgramDishSchema {
  @belongsTo(() => Dish, { foreignKey: 'dishId' })
  declare dish: BelongsTo<typeof Dish>

  @hasMany(() => ProgramDishAccompaniment, { foreignKey: 'programDishId' })
  declare accompaniments: HasMany<typeof ProgramDishAccompaniment>
}
