import type Program from '#models/program'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Forme « résumé » d'un programme pour la liste : intervalle + compteurs.
 * `ordersCount` reste à 0 en attendant le module Commandes.
 */
export default class ProgramSummaryTransformer extends BaseTransformer<Program> {
  toObject() {
    const p = this.resource
    const entries = p.entries ?? []
    const scheduledDates = new Set(entries.map((e) => e.scheduledDate.toISODate()))
    const daysCount = Math.round(p.endDate.diff(p.startDate, 'days').days) + 1

    return {
      id: p.id,
      code: p.code,
      title: p.title,
      description: p.description,
      startDate: p.startDate.toISODate(),
      endDate: p.endDate.toISODate(),
      daysCount,
      scheduledDaysCount: scheduledDates.size,
      dishesCount: entries.length,
      ordersCount: 0,
      createdAt: p.createdAt.toISO(),
    }
  }
}
