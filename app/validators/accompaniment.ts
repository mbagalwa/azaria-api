import vine from '@vinejs/vine'

/**
 * Un accompagnement (riz, banane plantain, salade…). Comme pour les plats, les
 * valeurs arrivent en multipart/form-data : VineJS caste `priceCents` et
 * `isAvailable`.
 */
const name = () => vine.string().trim().minLength(2).maxLength(120)
const description = () => vine.string().trim().maxLength(1000).nullable()
/** Supplément en centimes USD. 0 = inclus dans le prix du plat. */
const priceCents = () => vine.number().withoutDecimals().min(0).max(100_000_000)
const isAvailable = () => vine.boolean()

export const createAccompanimentValidator = vine.create({
  name: name(),
  description: description().optional(),
  priceCents: priceCents().optional(),
  isAvailable: isAvailable().optional(),
})

export const updateAccompanimentValidator = vine.create({
  name: name().optional(),
  description: description().optional(),
  priceCents: priceCents().optional(),
  isAvailable: isAvailable().optional(),
})
