/**
 * Normalisation des numéros de téléphone au format E.164 — le seul format
 * accepté par l'API WhatsApp Cloud (`+243…`, sans espace ni tiret).
 *
 * Le client saisit son numéro comme il veut (`0991 234 567`, `+243 991 234 567`,
 * `243991234567`) : on ramène tout à `+243991234567`. Le pays par défaut est la
 * RDC, seul marché d'Azaria pour l'instant.
 */

/** Indicatif pays par défaut (RDC). */
export const DEFAULT_COUNTRY_CODE = '243'

/** Longueur du numéro national congolais, indicatif exclu (9 chiffres). */
const NATIONAL_LENGTH = 9

/**
 * Ramène une saisie libre à un E.164 (`+243991234567`), ou `null` si le numéro
 * ne peut pas être interprété.
 */
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null

  const raw = String(input).trim()
  const hasPlus = raw.startsWith('+')
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // Déjà international : soit saisi avec un +, soit préfixé par l'indicatif.
  if (hasPlus) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null
  }
  if (digits.startsWith('00')) {
    const rest = digits.slice(2)
    return rest.length >= 8 && rest.length <= 15 ? `+${rest}` : null
  }
  if (
    digits.startsWith(DEFAULT_COUNTRY_CODE) &&
    digits.length === DEFAULT_COUNTRY_CODE.length + NATIONAL_LENGTH
  ) {
    return `+${digits}`
  }

  // National : 0991234567 (10 chiffres, le 0 saute) ou 991234567 (9 chiffres).
  const national = digits.startsWith('0') ? digits.slice(1) : digits
  if (national.length === NATIONAL_LENGTH) return `+${DEFAULT_COUNTRY_CODE}${national}`

  return null
}

/** Affichage lisible : `+243 991 234 567`. */
export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return ''
  const digits = e164.replace(/\D/g, '')
  if (!digits.startsWith(DEFAULT_COUNTRY_CODE)) return e164
  const national = digits.slice(DEFAULT_COUNTRY_CODE.length)
  if (national.length !== NATIONAL_LENGTH) return e164
  return `+${DEFAULT_COUNTRY_CODE} ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`
}
