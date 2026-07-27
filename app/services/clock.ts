import { DateTime } from 'luxon'

/**
 * Fuseau métier d'Azaria (Goma, RDC Est) : UTC+2 toute l'année, sans heure d'été.
 *
 * Toutes les décisions « quel jour ? » et « l'heure limite est-elle passée ? » se
 * prennent dans CE fuseau, jamais dans celui du process (souvent UTC en prod).
 * Sans ça, le cut-off « 9h » se déclenche à 11h locale et la date bascule 2h trop
 * tôt autour de minuit.
 */
export const BUSINESS_TZ = 'Africa/Lubumbashi'

/** Instant courant dans le fuseau métier. */
export function nowLocal(): DateTime {
  return DateTime.now().setZone(BUSINESS_TZ)
}

/** Date du jour (AAAA-MM-JJ) dans le fuseau métier. */
export function todayLocalISO(): string {
  return nowLocal().toISODate()!
}

/** Interprète une date AAAA-MM-JJ comme un jour du fuseau métier (00:00 local). */
export function dayInBusinessTz(iso: string): DateTime {
  return DateTime.fromISO(iso, { zone: BUSINESS_TZ })
}

/** Convertit "HH:MM" en minutes depuis minuit ; `null` si le format est invalide. */
export function parseHmToMinutes(hm: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hm)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}
