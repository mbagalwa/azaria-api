import vine from '@vinejs/vine'

/** Heure au format HH:MM (24 h). */
const time = () =>
  vine
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)

/**
 * Réglages du restaurant. Tous les champs sont optionnels : un PUT applique
 * un patch partiel fusionné aux valeurs existantes.
 */
export const restaurantSettingsValidator = vine.create({
  currency: vine.string().trim().maxLength(8).optional(),
  phone: vine.string().trim().maxLength(40).nullable().optional(),
  whatsapp: vine.string().trim().maxLength(40).nullable().optional(),
  email: vine.string().trim().email().maxLength(254).nullable().optional(),
  address: vine.string().trim().maxLength(200).nullable().optional(),
  city: vine.string().trim().maxLength(80).nullable().optional(),
  hours: vine.string().trim().maxLength(200).nullable().optional(),
  deliveryFeeCents: vine.number().withoutDecimals().min(0).max(100_000_000).optional(),
  /** Heure limite (HH:MM) pour commander le jour même. */
  orderCutoff: time().optional(),
  /** Services (déjeuner, dîner…) avec leur heure limite de commande. */
  services: vine
    .array(
      vine.object({
        name: vine.string().trim().minLength(1).maxLength(60),
        cutoff: time(),
      }),
    )
    .optional(),
})

/** Réglages des notifications (canaux et déclencheurs). */
export const notificationsSettingsValidator = vine.create({
  emailEnabled: vine.boolean().optional(),
  whatsappEnabled: vine.boolean().optional(),
  senderEmail: vine.string().trim().email().maxLength(254).nullable().optional(),
  whatsappNumber: vine.string().trim().maxLength(40).nullable().optional(),
  notifyNewOrder: vine.boolean().optional(),
  notifyStatusChange: vine.boolean().optional(),
})
