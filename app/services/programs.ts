import Accompaniment from '#models/accompaniment'
import Dish from '#models/dish'
import Program from '#models/program'
import ProgramDish from '#models/program_dish'
import ProgramDishAccompaniment from '#models/program_dish_accompaniment'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'

/** Alphabet lisible (sans I, L, O, 0, 1) pour le code de programme. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomCode(len = 6): string {
  const bytes = randomBytes(len)
  let out = ''
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return `PRG-${out}`
}

/** Génère un code de programme unique (quelques tentatives anti-collision). */
export async function generateUniqueProgramCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomCode()
    const exists = await Program.findBy('code', code)
    if (!exists) return code
  }
  throw new Exception('Impossible de générer un code de programme unique.', {
    status: 500,
    code: 'E_CODE_GENERATION',
  })
}

export type ProgramEntryInput = {
  date: string
  dishId: number
  priceCents: number
  accompaniments?: { accompanimentId: number; priceCents: number }[]
}

export type ProgramInput = {
  title?: string | null
  description?: string | null
  startDate: string
  endDate: string
  /** Une entrée par date : LE plat du jour et ses accompagnements. */
  entries?: ProgramEntryInput[]
}

type PreparedRow = {
  scheduledDate: DateTime
  dishId: number
  priceCents: number
  accompaniments: { accompanimentId: number; priceCents: number }[]
}

/**
 * Valide le payload (fin ≥ début, dates dans l'intervalle, une seule entrée par
 * date, plats et accompagnements existants) et le normalise en lignes prêtes à
 * insérer. Les prix fournis par l'admin sont figés tels quels.
 */
async function prepare(input: ProgramInput): Promise<PreparedRow[]> {
  const start = DateTime.fromISO(input.startDate)
  const end = DateTime.fromISO(input.endDate)
  if (!start.isValid || !end.isValid) {
    throw new Exception('Dates invalides.', { status: 422, code: 'E_INVALID_DATES' })
  }
  if (end < start) {
    throw new Exception('La date de fin doit être postérieure ou égale au début.', {
      status: 422,
      code: 'E_DATE_ORDER',
    })
  }

  const rows: PreparedRow[] = []
  const usedDates = new Set<string>()
  const dishIds = new Set<number>()
  const accompanimentIds = new Set<number>()

  for (const entry of input.entries ?? []) {
    const date = DateTime.fromISO(entry.date)
    if (!date.isValid || date < start || date > end) {
      throw new Exception(`La date ${entry.date} est hors de l'intervalle.`, {
        status: 422,
        code: 'E_DATE_OUT_OF_RANGE',
      })
    }
    if (usedDates.has(entry.date)) {
      throw new Exception(`Un seul plat par jour : ${entry.date} est en double.`, {
        status: 422,
        code: 'E_DUPLICATE_DATE',
      })
    }
    usedDates.add(entry.date)
    dishIds.add(entry.dishId)

    /** Dédoublonne les accompagnements d'une même date (1re occurrence gagnante). */
    const seen = new Set<number>()
    const accompaniments: { accompanimentId: number; priceCents: number }[] = []
    for (const a of entry.accompaniments ?? []) {
      if (seen.has(a.accompanimentId)) continue
      seen.add(a.accompanimentId)
      accompanimentIds.add(a.accompanimentId)
      accompaniments.push({ accompanimentId: a.accompanimentId, priceCents: a.priceCents })
    }

    rows.push({
      scheduledDate: date,
      dishId: entry.dishId,
      priceCents: entry.priceCents,
      accompaniments,
    })
  }

  await assertAllExist(
    Dish,
    dishIds,
    'Un ou plusieurs plats sélectionnés sont introuvables.',
    'E_DISH_NOT_FOUND'
  )
  await assertAllExist(
    Accompaniment,
    accompanimentIds,
    'Un ou plusieurs accompagnements sélectionnés sont introuvables.',
    'E_ACCOMPANIMENT_NOT_FOUND'
  )

  return rows
}

/** Vérifie en une requête que tous les ids existent bien. */
async function assertAllExist(
  model: typeof Dish | typeof Accompaniment,
  ids: Set<number>,
  message: string,
  code: string
): Promise<void> {
  if (ids.size === 0) return
  const found = await model
    .query()
    .whereIn('id', [...ids])
    .count('* as total')
  if (Number(found[0].$extras.total) !== ids.size) {
    throw new Exception(message, { status: 422, code })
  }
}

/** Insère les entrées d'un programme puis leurs accompagnements. */
async function insertEntries(
  trx: TransactionClientContract,
  programId: number,
  rows: PreparedRow[]
): Promise<void> {
  if (!rows.length) return

  const created = await ProgramDish.createMany(
    rows.map((r) => ({
      programId,
      scheduledDate: r.scheduledDate,
      dishId: r.dishId,
      priceCents: r.priceCents,
    })),
    { client: trx }
  )

  /** `createMany` conserve l'ordre : la i-ème ligne correspond à la i-ème entrée. */
  const links = created.flatMap((programDish, i) =>
    rows[i].accompaniments.map((a) => ({
      programDishId: programDish.id,
      accompanimentId: a.accompanimentId,
      priceCents: a.priceCents,
    }))
  )
  if (links.length) {
    await ProgramDishAccompaniment.createMany(links, { client: trx })
  }
}

/** Crée un programme et ses entrées dans une transaction. */
export async function createProgram(input: ProgramInput): Promise<Program> {
  const rows = await prepare(input)
  const code = await generateUniqueProgramCode()

  return db.transaction(async (trx) => {
    const program = await Program.create(
      {
        code,
        title: input.title ?? null,
        description: input.description ?? null,
        startDate: DateTime.fromISO(input.startDate),
        endDate: DateTime.fromISO(input.endDate),
      },
      { client: trx }
    )
    await insertEntries(trx, program.id, rows)
    return program
  })
}

/** Met à jour un programme et remplace intégralement ses entrées. */
export async function updateProgram(program: Program, input: ProgramInput): Promise<Program> {
  const rows = await prepare(input)

  return db.transaction(async (trx) => {
    program.useTransaction(trx)
    program.merge({
      title: input.title ?? null,
      description: input.description ?? null,
      startDate: DateTime.fromISO(input.startDate),
      endDate: DateTime.fromISO(input.endDate),
    })
    await program.save()

    /** CASCADE : supprimer les entrées emporte leurs accompagnements. */
    await ProgramDish.query({ client: trx }).where('program_id', program.id).delete()
    await insertEntries(trx, program.id, rows)
    return program
  })
}
