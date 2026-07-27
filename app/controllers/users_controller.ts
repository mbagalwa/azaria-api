import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { createUserValidator, updateUserValidator } from '#validators/user'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /** Liste des comptes du staff (les clients ne sont pas gérés ici). */
  async index(ctx: HttpContext) {
    this.ensureManager(ctx)
    const users = await User.query().whereNot('role', 'customer').orderBy('created_at', 'desc')
    return ctx.serialize(UserTransformer.transform(users))
  }

  /** Détail d'un compte staff. */
  async show(ctx: HttpContext) {
    this.ensureManager(ctx)
    const user = await User.findOrFail(ctx.params.id)
    return ctx.serialize(UserTransformer.transform(user))
  }

  /** Crée un compte staff avec un mot de passe fixé par l'admin. */
  async store(ctx: HttpContext) {
    this.ensureManager(ctx)
    const { fullName, email, password, role } = await ctx.request.validateUsing(createUserValidator)
    const user = await User.create({
      fullName: fullName ?? null,
      email,
      password,
      role,
      isActive: true,
    })
    return ctx.serialize(UserTransformer.transform(user))
  }

  /** Met à jour un compte (nom, email, rôle, activation) - patch partiel. */
  async update(ctx: HttpContext) {
    this.ensureManager(ctx)
    const user = await User.findOrFail(ctx.params.id)
    const data = await ctx.request.validateUsing(updateUserValidator)

    if (data.email && data.email !== user.email) {
      const clash = await User.query().where('email', data.email).whereNot('id', user.id).first()
      if (clash) {
        throw new Exception('Cet email est déjà utilisé.', {
          status: 422,
          code: 'E_EMAIL_TAKEN',
        })
      }
    }

    const isSelf = ctx.auth.getUserOrFail().id === user.id
    if (isSelf && data.isActive === false) {
      throw new Exception('Vous ne pouvez pas désactiver votre propre compte.', {
        status: 422,
        code: 'E_SELF_DISABLE',
      })
    }
    if (isSelf && data.role && data.role !== 'manager') {
      throw new Exception('Vous ne pouvez pas retirer votre propre rôle manager.', {
        status: 422,
        code: 'E_SELF_DEMOTE',
      })
    }

    const losesManagerAccess =
      (data.role !== undefined && data.role !== 'manager') || data.isActive === false
    if (user.role === 'manager' && losesManagerAccess) {
      await this.assertOtherActiveManagerExists(user.id)
    }

    user.merge({
      ...(data.fullName !== undefined ? { fullName: data.fullName } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.role !== undefined ? { role: data.role } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    })
    await user.save()

    return ctx.serialize(UserTransformer.transform(user))
  }

  /** Supprime un compte (interdit sur soi-même et sur le dernier manager actif). */
  async destroy(ctx: HttpContext) {
    this.ensureManager(ctx)
    const user = await User.findOrFail(ctx.params.id)

    if (ctx.auth.getUserOrFail().id === user.id) {
      throw new Exception('Vous ne pouvez pas supprimer votre propre compte.', {
        status: 422,
        code: 'E_SELF_DELETE',
      })
    }
    if (user.role === 'manager') {
      await this.assertOtherActiveManagerExists(user.id)
    }

    await user.delete()
    return { message: 'Utilisateur supprimé.' }
  }

  /** Garantit qu'au moins un autre manager actif subsiste (anti-verrouillage). */
  private async assertOtherActiveManagerExists(excludeId: number) {
    const row = await User.query()
      .where('role', 'manager')
      .where('is_active', true)
      .whereNot('id', excludeId)
      .count('* as total')
      .first()
    const total = Number(row?.$extras.total ?? 0)
    if (total < 1) {
      throw new Exception('Il doit rester au moins un manager actif.', {
        status: 422,
        code: 'E_LAST_MANAGER',
      })
    }
  }

  /** Réserve la gestion des comptes aux managers. */
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
