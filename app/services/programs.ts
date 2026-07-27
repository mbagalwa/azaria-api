import Dish from '#models/dish'
import Program from '#models/program'
import ProgramDish from '#models/program_dish'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
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

export type ProgramInput = {
  title?: string | null
  description?: string | null
  startDate: string
  endDate: string
  entries?: { date: string; dishes: { dishId: number; priceCents: number }[] }[]
}

type PreparedEntries = {
  rows: { scheduledDate: DateTime; dishId: number; priceCents: number }[]
}

/**
 * Valide le payload (fin ≥ début, dates dans l'intervalle, plats existants)
 * et aplatit les entrées en lignes program_dishes dédoublonnées (le prix figé
 * de chaque plat est celui fourni par l'admin).
 */
async function prepare(input: ProgramInput): Promise<PreparedEntries> {
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

  const rows: { scheduledDate: DateTime; dishId: number; priceCents: number }[] = []
  const allDishIds = new Set<number>()

  for (const entry of input.entries ?? []) {
    const date = DateTime.fromISO(entry.date)
    if (!date.isValid || date < start || date > end) {
      throw new Exception(`La date ${entry.date} est hors de l'intervalle.`, {
        status: 422,
        code: 'E_DATE_OUT_OF_RANGE',
      })
    }
    const seen = new Set<number>()
    for (const dish of entry.dishes) {
      if (seen.has(dish.dishId)) continue
      seen.add(dish.dishId)
      allDishIds.add(dish.dishId)
      rows.push({ scheduledDate: date, dishId: dish.dishId, priceCents: dish.priceCents })
    }
  }

  if (allDishIds.size > 0) {
    const found = await Dish.query().whereIn('id', [...allDishIds]).count('* as total')
    const total = Number(found[0].$extras.total)
    if (total !== allDishIds.size) {
      throw new Exception('Un ou plusieurs plats sélectionnés sont introuvables.', {
        status: 422,
        code: 'E_DISH_NOT_FOUND',
      })
    }
  }

  return { rows }
}

/** Crée un programme et ses entrées dans une transaction. */
export async function createProgram(input: ProgramInput): Promise<Program> {
  const { rows } = await prepare(input)
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
      { client: trx },
    )
    if (rows.length) {
      await ProgramDish.createMany(
        rows.map((r) => ({ ...r, programId: program.id })),
        { client: trx },
      )
    }
    return program
  })
}

/** Met à jour un programme et remplace intégralement ses entrées. */
export async function updateProgram(program: Program, input: ProgramInput): Promise<Program> {
  const { rows } = await prepare(input)

  return db.transaction(async (trx) => {
    program.useTransaction(trx)
    program.merge({
      title: input.title ?? null,
      description: input.description ?? null,
      startDate: DateTime.fromISO(input.startDate),
      endDate: DateTime.fromISO(input.endDate),
    })
    await program.save()

    await ProgramDish.query({ client: trx }).where('program_id', program.id).delete()
    if (rows.length) {
      await ProgramDish.createMany(
        rows.map((r) => ({ ...r, programId: program.id })),
        { client: trx },
      )
    }
    return program
  })
}
