import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Accompaniment from '#models/accompaniment'
import Dish from '#models/dish'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import OrderItemAccompaniment from '#models/order_item_accompaniment'
import Program from '#models/program'
import ProgramDish from '#models/program_dish'
import ProgramDishAccompaniment from '#models/program_dish_accompaniment'
import { generateUniqueProgramCode } from '#services/programs'
import { DateTime } from 'luxon'
import { randomBytes, randomInt } from 'node:crypto'

/**
 * Simulation du flux client : commandes SANS COMPTE (nom + numéro WhatsApp
 * saisis au formulaire), 4 programmes hebdomadaires à UN plat par jour avec
 * leurs accompagnements, et des heures de livraison volontairement alignées
 * pour illustrer le groupement du calendrier. Idempotent : ne fait rien si des
 * commandes existent déjà.
 */

/** Clients fictifs : plus de compte, juste une identité de formulaire. */
const CUSTOMERS = [
  { fullName: 'Nadine Kabila', phone: '+243991000101' },
  { fullName: 'Jean Amisi', phone: '+243991000102' },
  { fullName: 'Aisha Mwamba', phone: '+243991000103' },
  { fullName: 'Patrick Byamungu', phone: '+243991000104' },
  { fullName: 'Grace Furaha', phone: '+243991000105' },
  { fullName: 'Moïse Kalinda', phone: '+243991000106' },
  { fullName: 'Esther Zawadi', phone: '+243991000107' },
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
    name: 'Poulet Moambe',
    description: 'Poulet mijoté à la sauce de noix de palme',
    priceCents: 900,
    category: 'Plats',
  },
  {
    name: 'Tilapia frit',
    description: 'Tilapia du lac Kivu, frit à la minute',
    priceCents: 950,
    category: 'Plats',
  },
]

/** Catalogue d'accompagnements : la plupart inclus, quelques-uns en supplément. */
const ACCOMPANIMENTS = [
  { name: 'Riz blanc', description: 'Riz parfumé nature', priceCents: 0 },
  { name: 'Banane plantain', description: 'Plantains mûrs frits', priceCents: 0 },
  { name: 'Fufu', description: 'Pâte de manioc', priceCents: 0 },
  { name: 'Chikwangue', description: 'Bâton de manioc traditionnel', priceCents: 0 },
  { name: 'Sombe', description: 'Feuilles de manioc pilées', priceCents: 100 },
  { name: 'Salade fraîche', description: 'Tomate, avocat, oignon rouge', priceCents: 150 },
  { name: 'Pili-pili maison', description: 'Sauce piquante préparée sur place', priceCents: 0 },
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

type ProgramDay = {
  date: DateTime
  entry: ProgramDish
  dish: Dish
  accompaniments: { id: number; name: string; priceCents: number }[]
}

export default class extends BaseSeeder {
  async run() {
    const existing = await Order.query().count('* as total').first()
    if (Number(existing?.$extras.total ?? 0) > 0) {
      console.log('→ Des commandes existent déjà : simulation ignorée.')
      return
    }

    /** 1. Catalogue : plats + accompagnements réutilisables. */
    for (const d of EXTRA_DISHES) {
      await Dish.firstOrCreate({ name: d.name }, { ...d, isAvailable: true })
    }
    for (const a of ACCOMPANIMENTS) {
      await Accompaniment.firstOrCreate({ name: a.name }, { ...a, isAvailable: true })
    }
    const dishes = await Dish.all()
    const accompaniments = await Accompaniment.all()

    /** 2. Quatre programmes hebdo (S-1 → S+2), UN SEUL plat par jour. */
    const monday = DateTime.now().startOf('week')
    const programDays: ProgramDay[] = []
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

      /** Un plat différent chaque jour de la semaine, sans répétition. */
      const weekDishes = shuffle(dishes)
      for (let d = 0; d <= 5; d++) {
        const date = start.plus({ days: d })
        const dish = weekDishes[d % weekDishes.length]
        const entry = await ProgramDish.create({
          programId: program.id,
          dishId: dish.id,
          scheduledDate: date,
          priceCents: dish.priceCents,
        })

        /** 3 à 5 accompagnements proposés avec le plat du jour. */
        const picked = shuffle(accompaniments).slice(0, 3 + randomInt(0, 3))
        await ProgramDishAccompaniment.createMany(
          picked.map((a) => ({
            programDishId: entry.id,
            accompanimentId: a.id,
            priceCents: a.priceCents,
          }))
        )

        programDays.push({
          date,
          entry,
          dish,
          accompaniments: picked.map((a) => ({
            id: a.id,
            name: a.name,
            priceCents: a.priceCents,
          })),
        })
      }
    }

    /** 3. Commandes invité réparties sur les jours programmés. */
    const today = DateTime.now().startOf('day')
    let ordersCount = 0

    for (const day of programDays) {
      const perDay = randomInt(0, 4) // 0 à 3 commandes ce jour-là
      for (let i = 0; i < perDay; i++) {
        const customer = CUSTOMERS[randomInt(0, CUSTOMERS.length)]
        const time = TIMES[randomInt(0, TIMES.length)]
        const mode = randomInt(0, 3) === 0 ? 'pickup' : 'delivery'
        const quantity = 1 + randomInt(0, 3)

        /** 0 à 2 accompagnements parmi ceux proposés ce jour-là. */
        const extras = shuffle(day.accompaniments).slice(0, randomInt(0, 3))
        const unitCents = day.entry.priceCents + extras.reduce((s, a) => s + a.priceCents, 0)
        const deliveryFeeCents = mode === 'delivery' ? 200 : 0
        const totalCents = unitCents * quantity + deliveryFeeCents

        let status: string
        let paymentStatus = 'unpaid'
        if (day.date < today) {
          status =
            randomInt(0, 10) === 0 ? 'cancelled' : mode === 'pickup' ? 'picked_up' : 'delivered'
          if (status !== 'cancelled') paymentStatus = 'paid'
        } else if (day.date.equals(today)) {
          status = ['confirmed', 'preparing', 'ready'][randomInt(0, 3)]
        } else {
          status = ['pending', 'confirmed'][randomInt(0, 2)]
        }

        const order = await Order.create({
          code: await uniqueOrderCode(),
          userId: null,
          customerName: customer.fullName,
          customerPhone: customer.phone,
          deliveryDate: day.date,
          deliveryTime: time,
          mode,
          address: mode === 'delivery' ? 'Av. du Lac 12, Goma' : null,
          landmark: mode === 'delivery' ? 'En face de la pharmacie' : null,
          status,
          /** Le client ne paie qu'à la livraison depuis la commande sans compte. */
          paymentMethod: 'cash_on_delivery',
          paymentStatus,
          deliveryFeeCents,
          totalCents,
          note: randomInt(0, 5) === 0 ? 'Sans piment, merci.' : null,
        })

        const item = await OrderItem.create({
          orderId: order.id,
          dishId: day.dish.id,
          name: day.dish.name,
          priceCents: day.entry.priceCents,
          quantity,
        })
        if (extras.length) {
          await OrderItemAccompaniment.createMany(
            extras.map((a) => ({
              orderItemId: item.id,
              accompanimentId: a.id,
              name: a.name,
              priceCents: a.priceCents,
            }))
          )
        }
        ordersCount++
      }
    }

    console.log(
      `→ Simulation : ${programsCount} programmes (1 plat/jour), ` +
        `${accompaniments.length} accompagnements, ${ordersCount} commandes invité.`
    )
  }
}
