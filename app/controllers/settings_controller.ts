import { getSettings, saveNotifications, saveRestaurant } from '#services/settings'
import {
  notificationsSettingsValidator,
  restaurantSettingsValidator,
} from '#validators/settings'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class SettingsController {
  /** Renvoie tous les groupes de réglages (fusionnés aux défauts). */
  async show(ctx: HttpContext) {
    this.ensureManager(ctx)
    return { data: await getSettings() }
  }

  /** Met à jour les réglages du restaurant (patch partiel). */
  async updateRestaurant(ctx: HttpContext) {
    this.ensureManager(ctx)
    const data = await ctx.request.validateUsing(restaurantSettingsValidator)
    return { data: await saveRestaurant(data) }
  }

  /** Met à jour les réglages de notifications (patch partiel). */
  async updateNotifications(ctx: HttpContext) {
    this.ensureManager(ctx)
    const data = await ctx.request.validateUsing(notificationsSettingsValidator)
    return { data: await saveNotifications(data) }
  }

  private ensureManager({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'manager') {
      throw new Exception("Action réservée à l'administration.", {
        status: 403,
        code: 'E_FORBIDDEN',
      })
    }
  }
}
