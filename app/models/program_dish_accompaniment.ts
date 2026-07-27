import { ProgramDishAccompanimentSchema } from '#database/schema'
import Accompaniment from '#models/accompaniment'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

/** Accompagnement proposé avec un plat programmé, à prix figé. */
export default class ProgramDishAccompaniment extends ProgramDishAccompanimentSchema {
  @belongsTo(() => Accompaniment, { foreignKey: 'accompanimentId' })
  declare accompaniment: BelongsTo<typeof Accompaniment>
}
