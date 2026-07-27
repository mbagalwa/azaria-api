import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Dish from '#models/dish'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import ProgramDish from '#models/program_dish'
import User from '#models/user'
import { DateTime } from 'luxon'
import { randomBytes, randomInt } from 'node:crypto'

/**
 * Garantit qu'AUJOURD'HUI, chaque plat du catalogue a au moins une commande
 * client. Idempotent : ne crée une commande que pour les plats pas encore
 * commandés aujourd'hui. Prix figé = prix du programme du jour si le plat y
 * figure, sinon prix catalogue.
 */

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

export default class extends BaseSeeder {
  async run() {
    const today = DateTime.now().startOf('day')
    const todayIso = today.toISODate()!

    const customers = await User.query().where('role', 'customer')
    if (customers.length === 0) {
      console.log('→ Aucun client fictif : lancez d’abord order_simulation_seeder.')
      return
    }

    const dishes = await Dish.all()

    /** Plats déjà commandés aujourd'hui (idempotence), via jointure. */
    const rows = await OrderItem.query()
      .join('orders', 'orders.id', 'order_items.order_id')
      .where('orders.delivery_date', todayIso)
      .select('order_items.dish_id')
    const alreadyOrdered = new Set(rows.map((r) => r.dishId).filter(Boolean))

    /** Prix du programme du jour par plat (prioritaire sur le catalogue). */
    const todaysProgram = await ProgramDish.query().where('scheduled_date', todayIso)
    const programPrice = new Map(todaysProgram.map((pd) => [pd.dishId, pd.priceCents]))

    let created = 0
    for (const dish of dishes) {
      if (alreadyOrdered.has(dish.id)) continue

      const customer = customers[randomInt(0, customers.length)]
      const time = TIMES[randomInt(0, TIMES.length)]
      const mode = randomInt(0, 3) === 0 ? 'pickup' : 'delivery'
      const priceCents = programPrice.get(dish.id) ?? dish.priceCents
      const quantity = 1 + randomInt(0, 2)
      const totalCents = priceCents * quantity

      const status = ['pending', 'confirmed', 'preparing', 'ready'][randomInt(0, 4)]
      const paymentMethod = randomInt(0, 2) === 0 ? 'mobile_money' : 'cash_on_delivery'
      const paymentStatus =
        paymentMethod === 'mobile_money' && randomInt(0, 2) === 0 ? 'paid' : 'unpaid'

      const order = await Order.create({
        code: await uniqueOrderCode(),
        userId: customer.id,
        deliveryDate: today,
        deliveryTime: time,
        mode,
        address: mode === 'delivery' ? 'Av. du Lac 12, Goma' : null,
        status,
        paymentMethod,
        paymentStatus,
        totalCents,
        note: null,
      })
      await OrderItem.create({
        orderId: order.id,
        dishId: dish.id,
        name: dish.name,
        priceCents,
        quantity,
      })
      created++
    }

    console.log(
      `→ Aujourd'hui (${todayIso}) : ${created} commande(s) ajoutée(s), ` +
        `${dishes.length - created} plat(s) déjà couvert(s).`,
    )
  }
}
