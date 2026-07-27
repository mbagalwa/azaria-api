import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { customerLoginValidator, customerSignupValidator } from '#validators/user'
import { Exception } from '@adonisjs/core/exceptions'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'

/** Normalise un numéro (sans espaces) pour le stockage et l'unicité. */
function normalizePhone(raw: string): string {
  return raw.replace(/\s+/g, '')
}

/**
 * Authentification des CLIENTS via numéro WhatsApp (l'admin garde l'auth par
 * email). L'email est synthétique (le client ne l'utilise jamais).
 */
export default class CustomerAuthController {
  async signup({ request, serialize }: HttpContext) {
    const { fullName, phone, password } = await request.validateUsing(customerSignupValidator)
    const normalized = normalizePhone(phone)

    const existing = await User.findBy('phone', normalized)
    if (existing) {
      throw new Exception('Ce numéro WhatsApp est déjà utilisé.', {
        status: 422,
        code: 'E_PHONE_TAKEN',
      })
    }

    const user = await User.create({
      fullName,
      phone: normalized,
      email: `${normalized.replace(/[^0-9]/g, '')}@wa.azaria.local`,
      password,
      role: 'customer',
      isActive: true,
    })
    const token = await User.accessTokens.create(user)

    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }

  async login({ request, serialize }: HttpContext) {
    const { phone, password } = await request.validateUsing(customerLoginValidator)
    const normalized = normalizePhone(phone)

    const user = await User.findBy('phone', normalized)
    const valid = user ? await hash.verify(user.password, password) : false
    if (!user || !valid) {
      throw new Exception('Numéro ou mot de passe incorrect.', {
        status: 401,
        code: 'E_INVALID_CREDENTIALS',
      })
    }
    if (!user.isActive) {
      throw new Exception('Ce compte est désactivé.', {
        status: 403,
        code: 'E_ACCOUNT_DISABLED',
      })
    }

    const token = await User.accessTokens.create(user)
    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
    })
  }
}
