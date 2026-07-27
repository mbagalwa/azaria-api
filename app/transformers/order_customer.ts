import type Order from '#models/order'

export type OrderCustomer = {
  /** Nom saisi dans le formulaire de commande. */
  fullName: string
  /** Numéro WhatsApp E.164 — canal de suivi du client. */
  phone: string | null
  initials: string
}

function initialsOf(name: string): string {
  const [first, last] = name.trim().split(/\s+/)
  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  return (first ?? '?').slice(0, 2).toUpperCase()
}

/**
 * Identité du commanditaire. Depuis la commande sans compte, elle vit sur la
 * commande elle-même (`customerName`/`customerPhone`) ; on retombe sur l'ancien
 * compte lié pour les commandes historiques.
 */
export function orderCustomer(order: Order): OrderCustomer {
  const fullName = order.customerName ?? order.customer?.fullName ?? 'Client'
  return {
    fullName,
    phone: order.customerPhone || order.customer?.phone || null,
    initials: initialsOf(fullName),
  }
}

/** Lignes de commande avec leurs accompagnements (libellés et prix figés). */
export function orderItems(order: Order) {
  return (order.items ?? []).map((i) => ({
    id: i.id,
    dishId: i.dishId,
    name: i.name,
    priceCents: i.priceCents,
    quantity: i.quantity,
    accompaniments: (i.accompaniments ?? []).map((a) => ({
      id: a.id,
      accompanimentId: a.accompanimentId,
      name: a.name,
      priceCents: a.priceCents,
    })),
  }))
}

/** Historique du cycle, trié croissant, pour la timeline de suivi. */
export function orderEvents(order: Order) {
  return (order.events ?? [])
    .slice()
    .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())
    .map((e) => ({ id: e.id, status: e.status, createdAt: e.createdAt.toISO() }))
}
