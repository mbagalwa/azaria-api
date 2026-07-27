import Order from '#models/order'
import { randomBytes } from 'node:crypto'

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomOrderCode(): string {
  const bytes = randomBytes(6)
  let out = ''
  for (let i = 0; i < 6; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return `ORD-${out}`
}

/** Code de commande unique lisible (ORD-XXXXXX). */
export async function generateUniqueOrderCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomOrderCode()
    if (!(await Order.findBy('code', code))) return code
  }
  throw new Error('Impossible de générer un code de commande unique.')
}
