import { formatPhone } from '#services/phone'
import { DateTime } from 'luxon'

/**
 * Rédaction des messages sortants (français, ton Azaria). Isolé du transport
 * pour rester testable et pour que le même texte serve WhatsApp et Telegram.
 */

export type NotifiableItem = {
  name: string
  quantity: number
  priceCents: number
  accompaniments: { name: string; priceCents: number }[]
}

export type NotifiableOrder = {
  code: string
  customerName: string
  customerPhone: string | null
  deliveryDate: string | null
  deliveryTime: string
  mode: string
  address: string | null
  landmark: string | null
  note: string | null
  status: string
  paymentStatus: string
  totalCents: number
  deliveryFeeCents: number
  items: NotifiableItem[]
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'en attente de confirmation',
  confirmed: 'confirmée',
  preparing: 'en préparation',
  ready: 'prête',
  delivering: 'en cours de livraison',
  delivered: 'livrée',
  picked_up: 'récupérée',
  cancelled: 'annulée',
}

/** Phrase de suivi propre à chaque statut (ce que le client doit faire/attendre). */
const STATUS_LINES: Record<string, string> = {
  confirmed: 'Nous avons confirmé votre commande, la cuisine s’en occupe.',
  preparing: 'Votre plat est en cours de préparation 👨‍🍳',
  ready: 'Votre commande est prête !',
  delivering: 'Votre commande est en route 🛵',
  delivered: 'Votre commande a été livrée. Bon appétit ! 😋',
  picked_up: 'Votre commande a bien été récupérée. Bon appétit ! 😋',
  cancelled: 'Votre commande a été annulée. Contactez-nous si c’est une erreur.',
}

export function formatUsd(cents: number): string {
  return `${(cents / 100).toFixed(2)} $`
}

export function formatDateFr(iso: string | null): string {
  if (!iso) return ''
  const d = DateTime.fromISO(iso).setLocale('fr')
  return d.isValid ? d.toFormat('cccc d LLLL') : iso
}

export function modeLabel(mode: string): string {
  return mode === 'pickup' ? 'Retrait sur place' : 'Livraison'
}

function itemLines(items: NotifiableItem[]): string {
  return items
    .map((i) => {
      const extras = i.accompaniments.length
        ? `\n   ↳ ${i.accompaniments.map((a) => a.name).join(', ')}`
        : ''
      return `• ${i.quantity} × ${i.name}${extras}`
    })
    .join('\n')
}

/** Accusé de réception envoyé au client juste après l'enregistrement. */
export function customerOrderReceived(order: NotifiableOrder, trackUrl: string | null): string {
  const lines = [
    `Bonjour ${order.customerName} 👋`,
    '',
    `Nous avons bien reçu votre commande *${order.code}* chez Azaria. Merci !`,
    '',
    itemLines(order.items),
    '',
    `📅 ${formatDateFr(order.deliveryDate)} à ${order.deliveryTime}`,
    `${order.mode === 'pickup' ? '🏠' : '🛵'} ${modeLabel(order.mode)}${
      order.address ? ` — ${order.address}` : ''
    }`,
    `💰 Total : ${formatUsd(order.totalCents)} (paiement à la livraison)`,
    '',
    'Nous vous tenons au courant ici dès que la commande est confirmée.',
  ]
  if (trackUrl) lines.push('', `Suivre ma commande : ${trackUrl}`)
  return lines.filter((l) => l !== undefined).join('\n')
}

/** Notification de changement de statut envoyée au client. */
export function customerStatusChanged(order: NotifiableOrder, trackUrl: string | null): string {
  const label = STATUS_LABELS[order.status] ?? order.status
  const extra = STATUS_LINES[order.status]
  const lines = [
    `Commande *${order.code}* — ${label.toUpperCase()}`,
    '',
    extra ?? '',
    '',
    `📅 ${formatDateFr(order.deliveryDate)} à ${order.deliveryTime}`,
    `💰 ${formatUsd(order.totalCents)}`,
  ]
  if (trackUrl) lines.push('', `Suivi : ${trackUrl}`)
  return lines.filter(Boolean).join('\n')
}

/** Confirmation de paiement envoyée au client. */
export function customerPaymentChanged(order: NotifiableOrder): string {
  return order.paymentStatus === 'paid'
    ? `Commande *${order.code}* : paiement de ${formatUsd(order.totalCents)} bien reçu. Merci ! 🙏`
    : `Commande *${order.code}* : le paiement de ${formatUsd(order.totalCents)} est de nouveau marqué comme dû.`
}

/** Alerte interne (équipe Azaria) à chaque nouvelle commande. */
export function staffNewOrder(order: NotifiableOrder, adminUrl: string | null): string {
  const lines = [
    `🔔 <b>Nouvelle commande ${order.code}</b>`,
    '',
    `👤 ${order.customerName} — ${formatPhone(order.customerPhone) || 'numéro non renseigné'}`,
    `📅 ${formatDateFr(order.deliveryDate)} à ${order.deliveryTime}`,
    `${order.mode === 'pickup' ? '🏠' : '🛵'} ${modeLabel(order.mode)}`,
  ]
  if (order.address)
    lines.push(`📍 ${order.address}${order.landmark ? ` (${order.landmark})` : ''}`)
  lines.push('', itemLines(order.items).replace(/\*/g, ''))
  lines.push('', `💰 Total : ${formatUsd(order.totalCents)}`)
  if (order.deliveryFeeCents > 0) {
    lines.push(`   dont livraison : ${formatUsd(order.deliveryFeeCents)}`)
  }
  if (order.note) lines.push('', `📝 ${order.note}`)
  if (adminUrl) lines.push('', adminUrl)
  return lines.join('\n')
}

/** Version WhatsApp de l'alerte interne (pas de balises HTML). */
export function staffNewOrderPlain(order: NotifiableOrder, adminUrl: string | null): string {
  return staffNewOrder(order, adminUrl).replace(/<\/?b>/g, '*')
}
