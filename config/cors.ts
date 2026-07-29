import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

/**
 * Origines navigateur autorisées en production, lues depuis `CORS_ORIGIN`
 * (liste séparée par des virgules). Indispensable pour le temps réel SSE et
 * les appels front → API depuis le navigateur.
 */
const allowlist = (env.get('CORS_ORIGIN', '') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  /**
   * Enable or disable CORS handling globally.
   */
  enabled: true,

  /**
   * En développement, toutes les origines sont autorisées pour simplifier le
   * setup local. En production, on s'en tient à l'allowlist de `CORS_ORIGIN`.
   */
  origin: app.inDev ? true : allowlist,

  /**
   * HTTP methods accepted for cross-origin requests.
   */
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Reflect request headers by default. Use a string array to restrict
   * allowed headers.
   */
  headers: true,

  /**
   * Response headers exposed to the browser.
   */
  exposeHeaders: [],

  /**
   * Allow cookies/authorization headers on cross-origin requests.
   */
  credentials: true,

  /**
   * Cache CORS preflight response for N seconds.
   */
  maxAge: 90,
})

export default corsConfig
