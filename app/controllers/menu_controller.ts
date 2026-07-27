import ProgramDish from '#models/program_dish'
import { getSettings } from '#services/settings'
import { BUSINESS_TZ, nowLocal, parseHmToMinutes } from '#services/clock'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Menu proposé au client pour une date : plats programmés ET disponibles. */
export default class MenuController {
  async show(ctx: HttpContext) {
    const date = String(ctx.request.input('date', ''))
    if (!ISO_DATE.test(date)) {
      throw new Exception('Date invalide (AAAA-MM-JJ).', {
        status: 422,
        code: 'E_INVALID_DATE',
      })
    }

    const rows = await ProgramDish.query()
      .where('scheduled_date', date)
      .preload('dish')
      .orderBy('id', 'asc')

    const seen = new Set<number>()
    const dishes = []
    for (const pd of rows) {
      if (!pd.dish.isAvailable || seen.has(pd.dishId)) continue
      seen.add(pd.dishId)
      dishes.push({
        dishId: pd.dishId,
        name: pd.dish.name,
        description: pd.dish.description,
        imageUrl: pd.dish.imageUrl,
        category: pd.dish.category,
        priceCents: pd.priceCents,
      })
    }

    const { restaurant } = await getSettings()
    return {
      data: {
        date,
        dishes,
        deliveryFeeCents: restaurant.deliveryFeeCents,
        orderCutoff: restaurant.orderCutoff,
      },
    }
  }

  /**
   * Fenêtre de commande calculée dans le fuseau métier — source de vérité pour
   * l'app cliente (elle NE recalcule PLUS le cut-off elle-même) :
   *  - `today`     : date du jour (locale)
   *  - `earliest`  : 1re date commandable (aujourd'hui si avant le cut-off, sinon demain)
   *  - `cutoff`    : heure limite HH:MM
   */
  async window(_ctx: HttpContext) {
    const { restaurant } = await getSettings()
    const now = nowLocal()
    const nowMinutes = now.hour * 60 + now.minute
    const cutoffMinutes = parseHmToMinutes(restaurant.orderCutoff) ?? 9 * 60
    const afterCutoff = nowMinutes >= cutoffMinutes
    const today = now.toISODate()!
    const earliest = afterCutoff ? now.plus({ days: 1 }).toISODate()! : today
    return {
      data: { today, earliest, cutoff: restaurant.orderCutoff, afterCutoff, tz: BUSINESS_TZ },
    }
  }
}
