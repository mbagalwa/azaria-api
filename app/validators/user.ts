import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

/**
 * Validator to use when performing self-signup
 */
export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

/** Numéro de téléphone/WhatsApp (format souple : +, chiffres, espaces). */
const phone = () =>
  vine
    .string()
    .trim()
    .regex(/^\+?[0-9\s]{8,20}$/)

/** Inscription client via l'app : identifiant = numéro WhatsApp. */
export const customerSignupValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120),
  phone: phone(),
  password: password(),
})

/** Connexion client par numéro WhatsApp. */
export const customerLoginValidator = vine.create({
  phone: phone(),
  password: vine.string(),
})

/**
 * Rôles attribuables à un compte du staff depuis le back-office.
 * `customer` est réservé à l'inscription publique et n'est pas listé ici.
 */
export const ADMIN_ROLES = ['manager', 'cuisine'] as const

const fullName = () => vine.string().trim().minLength(2).maxLength(120)

/** Création d'un compte staff par un admin (mot de passe fixé directement). */
export const createUserValidator = vine.create({
  fullName: fullName().nullable().optional(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  role: vine.enum(ADMIN_ROLES),
})

/**
 * Mise à jour d'un compte staff (patch partiel). L'unicité de l'email hors
 * soi-même est vérifiée dans le contrôleur.
 */
export const updateUserValidator = vine.create({
  fullName: fullName().nullable().optional(),
  email: email().optional(),
  role: vine.enum(ADMIN_ROLES).optional(),
  isActive: vine.boolean().optional(),
})
