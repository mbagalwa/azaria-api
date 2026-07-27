import env from '#start/env'

/**
 * Client minimal de l'API WhatsApp Cloud (Meta Graph API).
 *
 * ⚠️ Règle Meta à connaître : un message ENVOYÉ À L'INITIATIVE DU COMMERÇANT
 * hors de la fenêtre de service de 24 h (24 h après le dernier message du
 * client) doit obligatoirement être un TEMPLATE approuvé. Un simple texte n'est
 * accepté que dans cette fenêtre. C'est pourquoi chaque envoi accepte un nom de
 * template optionnel : s'il est configuré, on part en template ; sinon on tente
 * le texte libre (suffisant en dev / dans la fenêtre de 24 h).
 *
 * Configuration (dans `.env`) :
 *   WHATSAPP_TOKEN            jeton d'accès permanent du système Meta
 *   WHATSAPP_PHONE_NUMBER_ID  identifiant du numéro expéditeur
 *   WHATSAPP_API_VERSION      version Graph API (défaut v23.0)
 *   WHATSAPP_TEMPLATE_LANG    langue des templates (défaut fr)
 *
 * Sans jeton configuré, l'envoi est « skipped » (et journalisé) : l'appli reste
 * pleinement fonctionnelle, on ne bloque jamais une commande sur WhatsApp.
 */

export type SendResult = {
  status: 'sent' | 'failed' | 'skipped'
  providerMessageId?: string | null
  error?: string | null
}

const GRAPH_BASE = 'https://graph.facebook.com'
const TIMEOUT_MS = 10_000

function config() {
  return {
    token: env.get('WHATSAPP_TOKEN', ''),
    phoneNumberId: env.get('WHATSAPP_PHONE_NUMBER_ID', ''),
    version: env.get('WHATSAPP_API_VERSION', 'v23.0'),
    lang: env.get('WHATSAPP_TEMPLATE_LANG', 'fr'),
  }
}

/** Vrai si les identifiants Meta sont présents (sinon tout envoi est « skipped »). */
export function isWhatsAppConfigured(): boolean {
  const { token, phoneNumberId } = config()
  return Boolean(token && phoneNumberId)
}

async function post(payload: Record<string, unknown>): Promise<SendResult> {
  const { token, phoneNumberId, version } = config()
  if (!token || !phoneNumberId) {
    return { status: 'skipped', error: 'WhatsApp non configuré (WHATSAPP_TOKEN manquant).' }
  }

  try {
    const response = await fetch(`${GRAPH_BASE}/${version}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    const body = (await response.json().catch(() => null)) as {
      messages?: { id: string }[]
      error?: { message?: string; code?: number }
    } | null

    if (!response.ok) {
      const detail = body?.error?.message ?? `HTTP ${response.status}`
      return { status: 'failed', error: detail }
    }
    return { status: 'sent', providerMessageId: body?.messages?.[0]?.id ?? null }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { status: 'failed', error: message }
  }
}

/** Message texte libre — valable seulement dans la fenêtre de service de 24 h. */
export function sendWhatsAppText(to: string, body: string): Promise<SendResult> {
  return post({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body },
  })
}

/**
 * Message template approuvé — le SEUL autorisé hors fenêtre de 24 h.
 * `params` remplit les variables {{1}}, {{2}}… du corps, dans l'ordre.
 */
export function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  params: string[]
): Promise<SendResult> {
  const { lang } = config()
  return post({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: lang },
      components: params.length
        ? [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }]
        : [],
    },
  })
}

/**
 * Envoi « au mieux » : template si un nom est configuré pour cet évènement,
 * texte libre sinon.
 */
export function sendWhatsApp(
  to: string,
  body: string,
  options: { template?: string | null; params?: string[] } = {}
): Promise<SendResult> {
  if (options.template) {
    return sendWhatsAppTemplate(to, options.template, options.params ?? [])
  }
  return sendWhatsAppText(to, body)
}
