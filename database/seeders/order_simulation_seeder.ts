import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Dish from '#models/dish'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import Program from '#models/program'
import ProgramDish from '#models/program_dish'
import User from '#models/user'
import { generateUniqueProgramCode } from '#services/programs'
import { DateTime } from 'luxon'
import { randomBytes, randomInt } from 'node:crypto'

/**
 * Simulation du flux client (tant que l'app customer n'existe pas) :
 * clients fictifs, plats, 4 programmes hebdomadaires et des commandes
 * réparties sur les jours, avec des heures de livraison volontairement
 * alignées pour illustrer le groupement du calendrier. Idempotent : ne fait
 * rien si des commandes existent déjà.
 */

const CUSTOMERS = [
  { fullName: 'Nadine Kabila', email: 'nadine@client.cd' },
  { fullName: 'Jean Amisi', email: 'jean@client.cd' },
  { fullName: 'Aisha Mwamba', email: 'aisha@client.cd' },
  { fullName: 'Patrick Byamungu', email: 'patrick@client.cd' },
  { fullName: 'Grace Furaha', email: 'grace@client.cd' },
  { fullName: 'Moïse Kalinda', email: 'moise@client.cd' },
  { fullName: 'Esther Zawadi', email: 'esther@client.cd' },
]

const EXTRA_DISHES = [
  {
    name: 'Thomson braisé',
    description: 'Poisson braisé, bananes plantains',
    priceCents: 1000,
    category: 'Plats',
  },
  {
    name: 'Riz aux haricots',
    description: 'Riz parfumé et haricots rouges mijotés',
    priceCents: 500,
    category: 'Plats',
  },
  {
    name: 'Brochettes de chèvre',
    description: 'Grillées au feu de bois, sauce pili-pili',
    priceCents: 800,
    category: 'Grillades',
  },
  {
    name: 'Jus de gingembre',
    description: 'Jus frais maison',
    priceCents: 150,
    category: 'Boissons',
  },
  {
    name: 'Salade avocat',
    description: 'Avocat, tomate, oignon rouge',
    priceCents: 350,
    category: 'Accompagnements',
  },
]

/** Heures volontairement peu nombreuses pour créer des groupes (12:00 favorisé). */
const TIMES = ['11:30', '12:00', '12:00', '12:30', '13:00', '19:00', '19:30']

const ORDER_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomOrderCode(): string {
  const bytes = randomBytes(6)
  let out = ''
  for (let i = 0; i < 6; i++) out += ORDER_ALPHABET[bytes[i] % ORDER_ALPHABET.length]
  return `ORD-${out}`
}

async function uniqueOrderCode(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const code = randomOrderCode()
    if (!(await Order.findBy('code', code))) return code
  }
  throw new Error('Code de commande introuvable')
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => randomInt(0, 2) - 0.5)
}

export default class extends BaseSeeder {
  async run() {
    const existing = await Order.query().count('* as total').first()
    if (Number(existing?.$extras.total ?? 0) > 0) {
      console.log('→ Des commandes existent déjà : simulation ignorée.')
      return
    }

    /** 1. Clients fictifs (role customer). */
    const customers: User[] = []
    for (const c of CUSTOMERS) {
      customers.push(
        await User.firstOrCreate(
          { email: c.email },
          { fullName: c.fullName, password: 'client2026', role: 'customer', isActive: true },
        ),
      )
    }

    /** 2. Plats supplémentaires pour étoffer le catalogue. */
    for (const d of EXTRA_DISHES) {
      await Dish.firstOrCreate({ name: d.name }, { ...d, isAvailable: true })
    }
    const dishes = await Dish.all()

    /** 3. Quatre programmes hebdo : S-1, S, S+1, S+2 (lundi → samedi). */
    const monday = DateTime.now().startOf('week')
    const programDays: { date: DateTime; entries: ProgramDish[] }[] = []
    let programsCount = 0

    for (const weekOffset of [-1, 0, 1, 2]) {
      const start = monday.plus({ weeks: weekOffset })
      const end = start.plus({ days: 5 })
      const program = await Program.create({
        code: await generateUniqueProgramCode(),
        title: `Semaine du ${start.setLocale('fr').toFormat('d MMMM')}`,
        description: 'Programme de simulation client.',
        startDate: start,
        endDate: end,
      })
      programsCount++

      for (let d = 0; d <= 5; d++) {
        const date = start.plus({ days: d })
        const dayDishes = shuffle(dishes).slice(0, 2 + randomInt(0, 2))
        const entries: ProgramDish[] = []
        for (const dish of dayDishes) {
          entries.push(
            await ProgramDish.create({
              programId: program.id,
              dishId: dish.id,
              scheduledDate: date,
              priceCents: dish.priceCents,
            }),
          )
        }
        programDays.push({ date, entries })
      }
    }

    /** 4. Commandes réparties sur les jours programmés. */
    const today = DateTime.now().startOf('day')
    let ordersCount = 0

    for (const { date, entries } of programDays) {
      const perDay = randomInt(0, 4) // 0 à 3 commandes ce jour-là
      for (let i = 0; i < perDay; i++) {
        const customer = customers[randomInt(0, customers.length)]
        const time = TIMES[randomInt(0, TIMES.length)]
        const mode = randomInt(0, 3) === 0 ? 'pickup' : 'delivery'

        const picks = shuffle(entries).slice(0, 1 + randomInt(0, 2))
        const itemsData = picks.map((pd) => {
          const dish = dishes.find((x) => x.id === pd.dishId)!
          return {
            dishId: pd.dishId,
            name: dish.name,
            priceCents: pd.priceCents, // prix FIGÉ du programme
            quantity: 1 + randomInt(0, 2),
          }
        })
        const totalCents = itemsData.reduce((s, it) => s + it.priceCents * it.quantity, 0)

        let status: string
        let paymentStatus = 'unpaid'
        if (date < today) {
          status =
            randomInt(0, 10) === 0
              ? 'cancelled'
              : mode === 'pickup'
                ? 'picked_up'
                : 'delivered'
          if (status !== 'cancelled') paymentStatus = 'paid'
        } else if (date.equals(today)) {
          status = ['confirmed', 'preparing', 'ready'][randomInt(0, 3)]
        } else {
          status = ['pending', 'confirmed'][randomInt(0, 2)]
        }
        const paymentMethod = randomInt(0, 2) === 0 ? 'mobile_money' : 'cash_on_delivery'
        if (paymentMethod === 'mobile_money' && status !== 'cancelled' && randomInt(0, 2) === 0) {
          paymentStatus = 'paid'
        }

        const order = await Order.create({
          code: await uniqueOrderCode(),
          userId: customer.id,
          deliveryDate: date,
          deliveryTime: time,
          mode,
          address: mode === 'delivery' ? 'Av. du Lac 12, Goma' : null,
          status,
          paymentMethod,
          paymentStatus,
          totalCents,
          note: randomInt(0, 5) === 0 ? 'Sans piment, merci.' : null,
        })
        await OrderItem.createMany(itemsData.map((it) => ({ ...it, orderId: order.id })))
        ordersCount++
      }
    }

    console.log(
      `→ Simulation : ${customers.length} clients, ${programsCount} programmes, ${ordersCount} commandes.`,
    )
  }
}
