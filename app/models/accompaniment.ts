import { AccompanimentSchema } from '#database/schema'

/**
 * Un accompagnement réutilisable (riz, banane plantain, salade…). Il est
 * rattaché à un plat AU SEIN d'un programme, avec un prix figé : `priceCents`
 * ici n'est que la valeur par défaut proposée à la programmation.
 */
export default class Accompaniment extends AccompanimentSchema {}
