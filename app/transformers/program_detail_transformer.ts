import type Program from '#models/program'
import { BaseTransformer } from '@adonisjs/core/transformers'

type AccompanimentLite = {
  id: number
  name: string
  /** Prix FIGÉ du supplément dans ce programme. */
  priceCents: number
  imageUrl: string | null
  isAvailable: boolean
}

type DishLite = {
  id: number
  name: string
  description: string | null
  priceCents: number
  category: string | null
  imageUrl: string | null
  isAvailable: boolean
  accompaniments: AccompanimentLite[]
}

/**
 * Forme « détail » d'un programme : LE plat du jour par date (`days`) avec ses
 * accompagnements, plus les compteurs. Sert à l'affichage comme au
 * préremplissage de l'édition.
 */
export default class ProgramDetailTransformer extends BaseTransformer<Program> {
  toObject() {
    const p = this.resource
    const entries = p.entries ?? []

    const days = entries
      .map((e) => {
        const dish: DishLite = {
          id: e.dish.id,
          name: e.dish.name,
          description: e.dish.description,
          /** Prix FIGÉ à la programmation (payé par le client), pas le catalogue. */
          priceCents: e.priceCents,
          category: e.dish.category,
          imageUrl: e.dish.imageUrl,
          isAvailable: e.dish.isAvailable,
          accompaniments: (e.accompaniments ?? [])
            .filter((a) => a.accompaniment)
            .map((a) => ({
              id: a.accompaniment.id,
              name: a.accompaniment.name,
              priceCents: a.priceCents,
              imageUrl: a.accompaniment.imageUrl,
              isAvailable: a.accompaniment.isAvailable,
            }))
            .sort((x, y) => x.name.localeCompare(y.name)),
        }
        return { date: e.scheduledDate.toISODate() ?? '', dish }
      })
      .sort((a, b) => a.date.localeCompare(b.date))

    const daysCount = Math.round(p.endDate.diff(p.startDate, 'days').days) + 1

    return {
      id: p.id,
      code: p.code,
      title: p.title,
      description: p.description,
      startDate: p.startDate.toISODate(),
      endDate: p.endDate.toISODate(),
      daysCount,
      scheduledDaysCount: days.length,
      dishesCount: entries.length,
      ordersCount: 0,
      createdAt: p.createdAt.toISO(),
      updatedAt: p.updatedAt?.toISO() ?? null,
      days,
    }
  }
}
