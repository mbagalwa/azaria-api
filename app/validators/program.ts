import vine from '@vinejs/vine'

/** Date calendaire au format YYYY-MM-DD. */
const isoDate = () =>
  vine
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)

/**
 * Payload d'un programme. Les bornes/dates sont des chaînes ISO (parse Luxon
 * côté contrôleur) ; les règles inter-champs (fin ≥ début, dates dans
 * l'intervalle, plats existants) sont vérifiées dans le contrôleur.
 */
export const programValidator = vine.create({
  title: vine.string().trim().maxLength(120).nullable().optional(),
  description: vine.string().trim().maxLength(2000).nullable().optional(),
  startDate: isoDate(),
  endDate: isoDate(),
  /**
   * Assignations : une entrée par date programmée (dates vides = absentes).
   * Chaque plat porte son PRIX FIGÉ (celui que le client paiera), par défaut
   * le prix catalogue au moment de la programmation, modifiable par l'admin.
   */
  entries: vine
    .array(
      vine.object({
        date: isoDate(),
        dishes: vine
          .array(
            vine.object({
              dishId: vine.number().positive(),
              priceCents: vine.number().withoutDecimals().min(0).max(100_000_000),
            }),
          )
          .minLength(1),
      }),
    )
    .optional(),
})
