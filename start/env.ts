/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Base de données PostgreSQL
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  // Compte administrateur par défaut (créé par le seeder)
  ADMIN_EMAIL: Env.schema.string(),
  ADMIN_PASSWORD: Env.schema.string(),
  ADMIN_NAME: Env.schema.string.optional(),

  // Cloudinary - hébergement des images de plats (upload signé côté API)
  CLOUDINARY_CLOUD_NAME: Env.schema.string(),
  CLOUDINARY_API_KEY: Env.schema.string(),
  CLOUDINARY_API_SECRET: Env.schema.string(),

  /**
   * WhatsApp Cloud API (Meta) — canal de suivi du client. Optionnel : sans
   * jeton, les envois sont journalisés en « skipped » et rien ne casse.
   */
  WHATSAPP_TOKEN: Env.schema.string.optional(),
  WHATSAPP_PHONE_NUMBER_ID: Env.schema.string.optional(),
  WHATSAPP_API_VERSION: Env.schema.string.optional(),
  WHATSAPP_TEMPLATE_LANG: Env.schema.string.optional(),

  /** Bot Telegram — alertes internes de l'équipe. Optionnel également. */
  TELEGRAM_BOT_TOKEN: Env.schema.string.optional(),

  /** URLs publiques, utilisées pour les liens dans les messages envoyés. */
  CUSTOMER_APP_URL: Env.schema.string.optional(),
  ADMIN_APP_URL: Env.schema.string.optional(),

  /**
   * Origines navigateur autorisées (CORS), séparées par des virgules. Requis
   * en production pour le temps réel SSE et tout appel front → API depuis le
   * navigateur (l'admin et le client). Ex. : https://admin.azaria.cd,https://azaria.cd
   */
  CORS_ORIGIN: Env.schema.string.optional(),
})
