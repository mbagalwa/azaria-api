import { menuForDate, menuForRange } from '#services/menu'
import { getSettings } from '#services/settings'
import { BUSINESS_TZ, nowLocal, parseHmToMinutes } from '#services/clock'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Nombre de jours affichés par la section « plats de la semaine ». */
const WEEK_LENGTH = 7

/**
 * Menu PUBLIC — aucune authentification : le client commande sans compte.
 * Ne renvoie que ce qui est nécessaire à la vitrine et au formulaire de commande.
 */
export default class PublicMenuController {
  /** Le plat du jour d'une date + les infos de tarification. */
  async show(ctx: HttpContext) {
    const date = String(ctx.request.input('date', ''))
    if (!ISO_DATE.test(date)) {
      throw new Exception('Date invalide (AAAA-MM-JJ).', { status: 422, code: 'E_INVALID_DATE' })
    }

    const [dish, { restaurant }] = await Promise.all([menuForDate(date), getSettings()])
    return {
      data: {
        date,
        dish,
        deliveryFeeCents: restaurant.deliveryFeeCents,
        orderCutoff: restaurant.orderCutoff,
      },
    }
  }

  /**
   * Les plats de la semaine : 7 jours à partir de `?from=` (défaut : la 1re
   * date commandable, cut-off compris). Les jours sans plat sont renvoyés avec
   * `dish: null` pour que la vitrine affiche la semaine complète.
   */
  async week(ctx: HttpContext) {
    const { restaurant } = await getSettings()
    const requested = String(ctx.request.input('from', ''))
    const from = ISO_DATE.test(requested)
      ? requested
      : this.earliestOrderableDate(restaurant.orderCutoff)

    const days = await menuForRange(from, WEEK_LENGTH)
    return {
      data: {
        from,
        days,
        deliveryFeeCents: restaurant.deliveryFeeCents,
        orderCutoff: restaurant.orderCutoff,
      },
    }
  }

  /**
   * Fenêtre de commande calculée dans le fuseau métier — source de vérité pour
   * la vitrine (elle NE recalcule PAS le cut-off elle-même) :
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

    return {
      data: {
        today: now.toISODate()!,
        earliest: afterCutoff ? now.plus({ days: 1 }).toISODate()! : now.toISODate()!,
        cutoff: restaurant.orderCutoff,
        afterCutoff,
        deliveryFeeCents: restaurant.deliveryFeeCents,
        tz: BUSINESS_TZ,
      },
    }
  }

  private earliestOrderableDate(cutoff: string): string {
    const now = nowLocal()
    const cutoffMinutes = parseHmToMinutes(cutoff) ?? 9 * 60
    const afterCutoff = now.hour * 60 + now.minute >= cutoffMinutes
    return (afterCutoff ? now.plus({ days: 1 }) : now).toISODate()!
  }
}
