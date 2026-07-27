import NotificationLog from '#models/notification_log'
import type Order from '#models/order'
import env from '#start/env'
import { getSettings } from '#services/settings'
import { normalizePhone } from '#services/phone'
import { sendWhatsApp, type SendResult } from '#services/notifications/whatsapp'
import { sendTelegram } from '#services/notifications/telegram'
import * as copy from '#services/notifications/messages'
import logger from '@adonisjs/core/services/logger'

/**
 * Orchestration des notifications de commande.
 *
 * Deux canaux, deux publics :
 *  - **WhatsApp → le client** : accusé de réception à la commande, puis chaque
 *    changement de statut. C'est son seul canal de suivi (il n'a pas de compte).
 *  - **Telegram (+ WhatsApp) → l'équipe** : alerte à chaque nouvelle commande.
 *
 * Tout est « au mieux » : un envoi qui échoue est journalisé dans
 * `notification_logs` mais ne fait JAMAIS échouer la commande. Les appels se
 * font en arrière-plan via `queue()`.
 */

type Channel = 'whatsapp' | 'telegram'
type Kind = 'order_received' | 'status_change' | 'payment_change' | 'admin_new_order'

/** Lance un envoi en arrière-plan : la réponse HTTP n'attend pas le réseau. */
export function queue(task: () => Promise<unknown>): void {
  void task().catch((error) => {
    logger.error({ err: error }, 'Notification: échec inattendu')
  })
}

async function record(
  orderId: number | null,
  channel: Channel,
  kind: Kind,
  recipient: string,
  body: string,
  result: SendResult
): Promise<void> {
  try {
    await NotificationLog.create({
      orderId,
      channel,
      kind,
      recipient,
      body,
      status: result.status,
      providerMessageId: result.providerMessageId ?? null,
      error: result.error ?? null,
    })
  } catch (error) {
    logger.error({ err: error }, 'Notification: journalisation impossible')
  }
  if (result.status === 'failed') {
    logger.warn({ channel, kind, recipient, error: result.error }, 'Notification non délivrée')
  }
}

/** Aplati une commande Lucid en payload de rédaction (items + accompagnements). */
export function toNotifiable(order: Order): copy.NotifiableOrder {
  return {
    code: order.code,
    customerName: order.customerName ?? 'client',
    customerPhone: order.customerPhone ?? null,
    deliveryDate: order.deliveryDate?.toISODate() ?? null,
    deliveryTime: order.deliveryTime,
    mode: order.mode,
    address: order.address,
    landmark: order.landmark,
    note: order.note,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalCents: order.totalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    items: (order.items ?? []).map((i) => ({
      name: i.name,
      quantity: i.quantity,
      priceCents: i.priceCents,
      accompaniments: (i.accompaniments ?? []).map((a) => ({
        name: a.name,
        priceCents: a.priceCents,
      })),
    })),
  }
}

function trackUrl(code: string): string | null {
  const base = env.get('CUSTOMER_APP_URL', '')
  return base ? `${base.replace(/\/$/, '')}/commande/${code}` : null
}

function adminUrl(date: string | null): string | null {
  const base = env.get('ADMIN_APP_URL', '')
  if (!base) return null
  return date
    ? `${base.replace(/\/$/, '')}/commandes/${date}`
    : `${base.replace(/\/$/, '')}/commandes`
}

/** Envoi WhatsApp vers le client, journalisé. */
async function toCustomer(
  order: Order,
  kind: Kind,
  body: string,
  template: string | null,
  params: string[]
): Promise<void> {
  const to = normalizePhone(order.customerPhone)
  if (!to) {
    await record(order.id, 'whatsapp', kind, order.customerPhone ?? '—', body, {
      status: 'skipped',
      error: 'Numéro WhatsApp du client absent ou illisible.',
    })
    return
  }
  const result = await sendWhatsApp(to, body, { template, params })
  await record(order.id, 'whatsapp', kind, to, body, result)
}

/** Nouvelle commande : accusé au client + alerte à l'équipe. */
export async function dispatchOrderCreated(order: Order): Promise<void> {
  const { notifications } = await getSettings()
  const payload = toNotifiable(order)
  const link = trackUrl(order.code)

  if (notifications.whatsappEnabled) {
    await toCustomer(
      order,
      'order_received',
      copy.customerOrderReceived(payload, link),
      notifications.whatsappTemplateOrderReceived,
      [
        payload.customerName,
        order.code,
        copy.formatDateFr(payload.deliveryDate),
        payload.deliveryTime,
      ]
    )
  }

  if (!notifications.notifyNewOrder) return
  const staffText = copy.staffNewOrder(payload, adminUrl(payload.deliveryDate))

  if (notifications.telegramEnabled && notifications.telegramChatId) {
    const result = await sendTelegram(notifications.telegramChatId, staffText)
    await record(
      order.id,
      'telegram',
      'admin_new_order',
      notifications.telegramChatId,
      staffText,
      result
    )
  }

  const staffPhone = normalizePhone(notifications.whatsappNumber)
  if (notifications.whatsappEnabled && staffPhone) {
    const plain = copy.staffNewOrderPlain(payload, adminUrl(payload.deliveryDate))
    const result = await sendWhatsApp(staffPhone, plain)
    await record(order.id, 'whatsapp', 'admin_new_order', staffPhone, plain, result)
  }
}

/** Changement de statut : le client est prévenu sur WhatsApp. */
export async function dispatchStatusChanged(order: Order): Promise<void> {
  const { notifications } = await getSettings()
  if (!notifications.whatsappEnabled || !notifications.notifyStatusChange) return

  const payload = toNotifiable(order)
  await toCustomer(
    order,
    'status_change',
    copy.customerStatusChanged(payload, trackUrl(order.code)),
    notifications.whatsappTemplateStatusChange,
    [order.code, copy.STATUS_LABELS[order.status] ?? order.status]
  )
}

/** Passage payé/non payé : confirmation au client. */
export async function dispatchPaymentChanged(order: Order): Promise<void> {
  const { notifications } = await getSettings()
  if (!notifications.whatsappEnabled || !notifications.notifyStatusChange) return

  const payload = toNotifiable(order)
  await toCustomer(order, 'payment_change', copy.customerPaymentChanged(payload), null, [])
}
