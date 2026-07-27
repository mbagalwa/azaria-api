import { ProgramDishSchema } from '#database/schema'
import Dish from '#models/dish'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/** Un plat programmé à une date donnée, au sein d'un programme. */
export default class ProgramDish extends ProgramDishSchema {
  @belongsTo(() => Dish, { foreignKey: 'dishId' })
  declare dish: BelongsTo<typeof Dish>
}
