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

/* -------------------------------------------------------------------------- */
/*  Variables des templates WhatsApp approuvés                                */
/*                                                                            */
/*  Une valeur de paramètre ne peut PAS contenir de saut de ligne : la liste   */
/*  des plats à puces du message libre est donc aplatie sur une seule ligne.   */
/*  Les noms de variables ci-dessous doivent correspondre EXACTEMENT à ceux    */
/*  déclarés dans WhatsApp Manager.                                           */
/* -------------------------------------------------------------------------- */

/** Quantité totale d'assiettes de la commande. */
function totalQuantity(order: NotifiableOrder): number {
  return order.items.reduce((sum, i) => sum + i.quantity, 0)
}

/** Les plats sur une seule ligne : « Poulet Moambe » ou « Poulet Moambe + 1 autre ». */
function dishSummary(order: NotifiableOrder): string {
  const [first, ...rest] = order.items
  if (!first) return '—'
  return rest.length ? `${first.name} + ${rest.length} autre(s)` : first.name
}

/** Accompagnements choisis, séparés par des virgules. */
function accompanimentSummary(order: NotifiableOrder): string {
  const names = order.items.flatMap((i) => i.accompaniments.map((a) => a.name))
  return names.length ? [...new Set(names)].join(', ') : 'aucun'
}

/** Où et comment : « Livraison — Av. du Lac 12 » ou « Retrait sur place ». */
function locationLabel(order: NotifiableOrder): string {
  if (order.mode === 'pickup') return 'Retrait sur place'
  return order.address ? `Livraison — ${order.address}` : 'Livraison'
}

/**
 * Suffixe du bouton « Suivre ma commande ». Le template ne fige que la BASE de
 * l'URL : le chemin de la page de suivi fait donc partie du suffixe dynamique.
 */
function trackingSuffix(order: NotifiableOrder): string {
  return `commande/${order.code}`
}

/**
 * Variables du template `new_order` (accusé de réception).
 * Les noms proviennent du modèle approuvé — les renommer ici sans les renommer
 * dans WhatsApp Manager fait échouer l'envoi.
 */
export function orderReceivedTemplate(order: NotifiableOrder) {
  return {
    /** Le corps affiche déjà « Commande bien reçue ✅ » : l'en-tête ne le répète pas. */
    header: { title: 'Accusé de réception 🎉' },
    body: {
      customer: order.customerName,
      order_id: order.code,
      qt: String(totalQuantity(order)),
      dish: dishSummary(order),
      dish_comple: accompanimentSummary(order),
      delivery_date: formatDateFr(order.deliveryDate),
      delivery_hours: order.deliveryTime,
      location: locationLabel(order),
      tot_price: formatUsd(order.totalCents),
    },
    buttonUrlSuffix: trackingSuffix(order),
  }
}

/** Variables du template `order_status` (changement de statut). */
export function statusChangedTemplate(order: NotifiableOrder) {
  return {
    header: { title: 'Suivi de votre commande' },
    body: {
      customer: order.customerName,
      order_id: order.code,
      order_status: STATUS_LABELS[order.status] ?? order.status,
      /** Repli obligatoire : une variable vide fait échouer l'envoi. */
      status_label: STATUS_LINES[order.status] ?? 'Nous vous tenons informé.',
      order_type: modeLabel(order.mode),
      order_date: `${formatDateFr(order.deliveryDate)} à ${order.deliveryTime}`,
    },
    buttonUrlSuffix: trackingSuffix(order),
  }
}
