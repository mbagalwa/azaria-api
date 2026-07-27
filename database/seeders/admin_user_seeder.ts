import env from '#start/env'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

/**
 * Crée (ou met à jour) le compte administrateur par défaut à partir des
 * variables ADMIN_* du `.env`. Idempotent : relançable sans créer de
 * doublon. Le mot de passe est haché automatiquement par le mixin
 * `withAuthFinder` du modèle User.
 */
export default class extends BaseSeeder {
  async run() {
    const email = env.get('ADMIN_EMAIL')

    await User.updateOrCreate(
      { email },
      {
        email,
        password: env.get('ADMIN_PASSWORD'),
        fullName: env.get('ADMIN_NAME') ?? 'Administrateur',
        role: 'manager',
      }
    )
  }
}
