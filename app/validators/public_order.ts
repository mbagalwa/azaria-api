import vine from '@vinejs/vine'

const isoDate = () =>
  vine
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
const time = () =>
  vine
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)

/**
 * Commande passée SANS COMPTE depuis la vitrine. Le client s'identifie par son
 * nom et son numéro WhatsApp — c'est le seul canal de suivi, donc le numéro est
 * obligatoire (normalisé en E.164 dans le contrôleur).
 *
 * Le plat n'est PAS choisi par le client : il n'y en a qu'un par jour, le
 * serveur le résout depuis le menu de la date. Seuls la quantité et les
 * accompagnements sont à sa main. Le cut-off et la disponibilité sont vérifiés
 * dans le contrôleur.
 */
export const createPublicOrderValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120),
  phone: vine.string().trim().minLength(6).maxLength(24),
  deliveryDate: isoDate(),
  deliveryTime: time(),
  mode: vine.enum(['delivery', 'pickup']),
  address: vine.string().trim().maxLength(200).nullable().optional(),
  landmark: vine.string().trim().maxLength(200).nullable().optional(),
  note: vine.string().trim().maxLength(500).nullable().optional(),
  quantity: vine.number().withoutDecimals().min(1).max(50),
  /** Accompagnements choisis parmi ceux proposés avec le plat du jour. */
  accompanimentIds: vine.array(vine.number().positive()).maxLength(20).optional(),
})
