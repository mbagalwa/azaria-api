import vine from '@vinejs/vine'

/**
 * Règles partagées d'un plat. Les valeurs arrivent en multipart/form-data
 * (donc en chaînes) : VineJS caste `priceCents` et `isAvailable`.
 */
const name = () => vine.string().trim().minLength(2).maxLength(120)
const description = () => vine.string().trim().maxLength(2000).nullable()
/** Prix en centimes de dollar : entier positif. */
const priceCents = () => vine.number().withoutDecimals().min(0).max(100_000_000)
const category = () => vine.string().trim().maxLength(60).nullable()
const isAvailable = () => vine.boolean()

/** Création : nom et prix requis, le reste optionnel. */
export const createDishValidator = vine.create({
  name: name(),
  description: description().optional(),
  priceCents: priceCents(),
  category: category().optional(),
  isAvailable: isAvailable().optional(),
})

/** Mise à jour : tous les champs optionnels (patch partiel). */
export const updateDishValidator = vine.create({
  name: name().optional(),
  description: description().optional(),
  priceCents: priceCents().optional(),
  category: category().optional(),
  isAvailable: isAvailable().optional(),
})
