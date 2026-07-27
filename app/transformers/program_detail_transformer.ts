import type Program from '#models/program'
import { BaseTransformer } from '@adonisjs/core/transformers'

type DishLite = {
  id: number
  name: string
  priceCents: number
  category: string | null
  imageUrl: string | null
  isAvailable: boolean
}

/**
 * Forme « détail » d'un programme : plats regroupés par date (`days`) + les
 * compteurs. Sert à la fois à l'affichage et au préremplissage de l'édition.
 */
export default class ProgramDetailTransformer extends BaseTransformer<Program> {
  toObject() {
    const p = this.resource
    const entries = p.entries ?? []

    const byDate = new Map<string, { date: string; dishes: DishLite[] }>()
    for (const e of entries) {
      const date = e.scheduledDate.toISODate() ?? ''
      if (!byDate.has(date)) byDate.set(date, { date, dishes: [] })
      byDate.get(date)!.dishes.push({
        id: e.dish.id,
        name: e.dish.name,
        /** Prix FIGÉ à la programmation (payé par le client), pas le catalogue. */
        priceCents: e.priceCents,
        category: e.dish.category,
        imageUrl: e.dish.imageUrl,
        isAvailable: e.dish.isAvailable,
      })
    }
    const days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
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
