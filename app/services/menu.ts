import ProgramDish from '#models/program_dish'
import { DateTime } from 'luxon'

/**
 * Lecture du menu-calendrier côté public.
 *
 * Règle métier : UN SEUL plat par jour. La contrainte d'unicité le garantit
 * DANS un programme, mais deux programmes peuvent se chevaucher sur une même
 * date — dans ce cas la ligne de plus petit `id` gagne. Ce même tri est réutilisé
 * à la création de commande : le client paie exactement le prix affiché.
 */

export type MenuAccompaniment = {
  id: number
  name: string
  description: string | null
  priceCents: number
  imageUrl: string | null
}

export type MenuDish = {
  dishId: number
  name: string
  description: string | null
  imageUrl: string | null
  category: string | null
  priceCents: number
  accompaniments: MenuAccompaniment[]
}

export type MenuDay = { date: string; dish: MenuDish | null }

function toMenuDish(entry: ProgramDish): MenuDish {
  return {
    dishId: entry.dishId,
    name: entry.dish.name,
    description: entry.dish.description,
    imageUrl: entry.dish.imageUrl,
    category: entry.dish.category,
    priceCents: entry.priceCents,
    accompaniments: (entry.accompaniments ?? [])
      .filter((link) => link.accompaniment?.isAvailable)
      .map((link) => ({
        id: link.accompaniment.id,
        name: link.accompaniment.name,
        description: link.accompaniment.description,
        /** Prix figé du supplément dans ce programme. */
        priceCents: link.priceCents,
        imageUrl: link.accompaniment.imageUrl,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }
}

/** Charge les plats programmés sur un intervalle, indexés par date ISO. */
async function loadRange(from: string, to: string): Promise<Map<string, ProgramDish>> {
  const rows = await ProgramDish.query()
    .where('scheduled_date', '>=', from)
    .where('scheduled_date', '<=', to)
    .preload('dish')
    .preload('accompaniments', (q) => q.preload('accompaniment'))
    .orderBy('id', 'asc')

  const byDate = new Map<string, ProgramDish>()
  for (const row of rows) {
    const iso = row.scheduledDate.toISODate()
    if (!iso || byDate.has(iso) || !row.dish.isAvailable) continue
    byDate.set(iso, row)
  }
  return byDate
}

/** LE plat du jour pour une date (ou `null` si rien de programmé/disponible). */
export async function menuForDate(date: string): Promise<MenuDish | null> {
  const byDate = await loadRange(date, date)
  const entry = byDate.get(date)
  return entry ? toMenuDish(entry) : null
}

/** Le menu de `days` jours consécutifs à partir de `from` (jours vides inclus). */
export async function menuForRange(from: string, days: number): Promise<MenuDay[]> {
  const start = DateTime.fromISO(from)
  const end = start.plus({ days: days - 1 })
  const byDate = await loadRange(start.toISODate()!, end.toISODate()!)

  return Array.from({ length: days }, (_, i) => {
    const date = start.plus({ days: i }).toISODate()!
    const entry = byDate.get(date)
    return { date, dish: entry ? toMenuDish(entry) : null }
  })
}
