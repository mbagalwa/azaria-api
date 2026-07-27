import vine from '@vinejs/vine'

const isoDate = () =>
  vine.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/)

const time = () =>
  vine.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

/**
 * Commande passée par un client depuis l'app. Le cut-off (9h le jour même) et
 * la disponibilité des plats au programme sont vérifiés dans le contrôleur.
 */
export const createCustomerOrderValidator = vine.create({
  deliveryDate: isoDate(),
  deliveryTime: time(),
  mode: vine.enum(['delivery', 'pickup']),
  address: vine.string().trim().maxLength(200).nullable().optional(),
  landmark: vine.string().trim().maxLength(200).nullable().optional(),
  paymentMethod: vine.enum(['cash_on_delivery', 'mobile_money']),
  note: vine.string().trim().maxLength(500).nullable().optional(),
  items: vine
    .array(
      vine.object({
        dishId: vine.number().positive(),
        quantity: vine.number().withoutDecimals().min(1).max(50),
      }),
    )
    .minLength(1),
})
