import env from '#start/env'
import type { SendResult } from '#services/notifications/whatsapp'

/**
 * Client minimal de la Bot API Telegram — utilisé pour le canal INTERNE
 * (alerte de l'équipe à chaque nouvelle commande). Contrairement à WhatsApp,
 * aucun template ni fenêtre de 24 h : un bot peut écrire librement à un chat
 * qui l'a démarré.
 *
 * Configuration :
 *   TELEGRAM_BOT_TOKEN   jeton donné par @BotFather
 *   (le chat destinataire vient des réglages Notifications, côté admin)
 */

const API_BASE = 'https://api.telegram.org'
const TIMEOUT_MS = 10_000

/** Vrai si le bot est configuré (sinon tout envoi est « skipped »). */
export function isTelegramConfigured(): boolean {
  return Boolean(env.get('TELEGRAM_BOT_TOKEN', ''))
}

/** Envoie un message à un chat (HTML autorisé pour le gras/les listes). */
export async function sendTelegram(chatId: string, text: string): Promise<SendResult> {
  const token = env.get('TELEGRAM_BOT_TOKEN', '')
  if (!token) {
    return { status: 'skipped', error: 'Telegram non configuré (TELEGRAM_BOT_TOKEN manquant).' }
  }
  if (!chatId) {
    return { status: 'skipped', error: 'Aucun chat Telegram renseigné dans les réglages.' }
  }

  try {
    const response = await fetch(`${API_BASE}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    const body = (await response.json().catch(() => null)) as {
      ok?: boolean
      description?: string
      result?: { message_id?: number }
    } | null

    if (!response.ok || !body?.ok) {
      return { status: 'failed', error: body?.description ?? `HTTP ${response.status}` }
    }
    return { status: 'sent', providerMessageId: String(body.result?.message_id ?? '') || null }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { status: 'failed', error: message }
  }
}
