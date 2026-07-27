import Setting from '#models/setting'

/** Un service de vente et son heure limite de commande (cut-off). */
export type ServiceSlot = { name: string; cutoff: string }

export type RestaurantSettings = {
  currency: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  city: string | null
  hours: string | null
  /** Frais de livraison en centimes USD (0 = gratuit). */
  deliveryFeeCents: number
  /** Heure limite (HH:MM) pour commander le jour même. Source de vérité unique. */
  orderCutoff: string
  services: ServiceSlot[]
}

export type NotificationsSettings = {
  emailEnabled: boolean
  whatsappEnabled: boolean
  senderEmail: string | null
  whatsappNumber: string | null
  notifyNewOrder: boolean
  notifyStatusChange: boolean
}

/** Devise verrouillée en USD (stockée en centimes ailleurs). */
export const DEFAULT_RESTAURANT: RestaurantSettings = {
  currency: 'USD',
  phone: null,
  whatsapp: null,
  email: null,
  address: null,
  city: null,
  hours: null,
  deliveryFeeCents: 200,
  orderCutoff: '09:00',
  services: [],
}

export const DEFAULT_NOTIFICATIONS: NotificationsSettings = {
  emailEnabled: false,
  whatsappEnabled: false,
  senderEmail: null,
  whatsappNumber: null,
  notifyNewOrder: true,
  notifyStatusChange: true,
}

/** Lit un groupe et le fusionne aux valeurs par défaut (tolérant au JSON cassé). */
async function readGroup<T extends object>(key: string, defaults: T): Promise<T> {
  const row = await Setting.findBy('key', key)
  if (!row?.value) return defaults
  try {
    return { ...defaults, ...(JSON.parse(row.value) as Partial<T>) }
  } catch {
    return defaults
  }
}

/** Écrit un patch partiel dans un groupe (upsert), en ignorant les `undefined`. */
async function saveGroup<T extends object>(
  key: string,
  defaults: T,
  patch: Partial<T>,
): Promise<T> {
  const current = await readGroup(key, defaults)
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  ) as Partial<T>
  const value = { ...current, ...clean }

  const row = await Setting.findBy('key', key)
  if (row) {
    row.value = JSON.stringify(value)
    await row.save()
  } else {
    await Setting.create({ key, value: JSON.stringify(value) })
  }
  return value
}

export async function getSettings() {
  const [restaurant, notifications] = await Promise.all([
    readGroup('restaurant', DEFAULT_RESTAURANT),
    readGroup('notifications', DEFAULT_NOTIFICATIONS),
  ])
  return { restaurant, notifications }
}

export function saveRestaurant(patch: Partial<RestaurantSettings>) {
  return saveGroup('restaurant', DEFAULT_RESTAURANT, patch)
}

export function saveNotifications(patch: Partial<NotificationsSettings>) {
  return saveGroup('notifications', DEFAULT_NOTIFICATIONS, patch)
}
