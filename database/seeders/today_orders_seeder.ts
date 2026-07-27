import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import OrderItemAccompaniment from '#models/order_item_accompaniment'
import ProgramDish from '#models/program_dish'
import { DateTime } from 'luxon'
import { randomBytes, randomInt } from 'node:crypto'

/**
 * Peuple le planning du jour : garantit qu'AUJOURD'HUI le plat programmé a au
 * moins `TARGET_ORDERS` commandes, réparties sur plusieurs créneaux. Idempotent :
 * ne complète que ce qui manque.
 *
 * Depuis la règle « un seul plat par jour », il n'y a qu'un plat à couvrir : ce
 * seeder sert à voir un planning journalier réaliste, pas à couvrir le catalogue.
 */

const TARGET_ORDERS = 6
const TIMES = ['11:30', '12:00', '12:00', '12:30', '13:00', '19:00', '19:30']

/** Clients fictifs (commande sans compte : nom + numéro WhatsApp). */
const CUSTOMERS = [
  { fullName: 'Nadine Kabila', phone: '+243991000101' },
  { fullName: 'Jean Amisi', phone: '+243991000102' },
  { fullName: 'Aisha Mwamba', phone: '+243991000103' },
  { fullName: 'Patrick Byamungu', phone: '+243991000104' },
  { fullName: 'Grace Furaha', phone: '+243991000105' },
  { fullName: 'Moïse Kalinda', phone: '+243991000106' },
  { fullName: 'Esther Zawadi', phone: '+243991000107' },
]

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
    const today = DateTime.now().startOf('day')
    const todayIso = today.toISODate()!

    /** Le plat du jour (même règle que le menu : plus petit id si chevauchement). */
    const entry = await ProgramDish.query()
      .where('scheduled_date', todayIso)
      .preload('dish')
      .preload('accompaniments', (q) => q.preload('accompaniment'))
      .orderBy('id', 'asc')
      .first()

    if (!entry) {
      console.log(`→ Aucun plat programmé le ${todayIso} : rien à faire.`)
      return
    }

    const existing = await Order.query().where('delivery_date', todayIso).count('* as total')
    const already = Number(existing[0].$extras.total ?? 0)
    const missing = Math.max(0, TARGET_ORDERS - already)
    if (missing === 0) {
      console.log(`→ Aujourd'hui (${todayIso}) : déjà ${already} commande(s).`)
      return
    }

    const offered = entry.accompaniments
      .filter((link) => link.accompaniment)
      .map((link) => ({
        id: link.accompaniment.id,
        name: link.accompaniment.name,
        priceCents: link.priceCents,
      }))

    for (let i = 0; i < missing; i++) {
      const customer = CUSTOMERS[randomInt(0, CUSTOMERS.length)]
      const time = TIMES[randomInt(0, TIMES.length)]
      const mode = randomInt(0, 3) === 0 ? 'pickup' : 'delivery'
      const quantity = 1 + randomInt(0, 3)
      const extras = shuffle(offered).slice(0, randomInt(0, 3))

      const unitCents = entry.priceCents + extras.reduce((s, a) => s + a.priceCents, 0)
      const deliveryFeeCents = mode === 'delivery' ? 200 : 0

      const order = await Order.create({
        code: await uniqueOrderCode(),
        userId: null,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        deliveryDate: today,
        deliveryTime: time,
        mode,
        address: mode === 'delivery' ? 'Av. du Lac 12, Goma' : null,
        landmark: mode === 'delivery' ? 'En face de la pharmacie' : null,
        status: ['pending', 'confirmed', 'preparing', 'ready'][randomInt(0, 4)],
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'unpaid',
        deliveryFeeCents,
        totalCents: unitCents * quantity + deliveryFeeCents,
        note: null,
      })

      const item = await OrderItem.create({
        orderId: order.id,
        dishId: entry.dishId,
        name: entry.dish.name,
        priceCents: entry.priceCents,
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
    }

    console.log(
      `→ Aujourd'hui (${todayIso}) : ${missing} commande(s) ajoutée(s) sur « ${entry.dish.name} ».`
    )
  }
}
