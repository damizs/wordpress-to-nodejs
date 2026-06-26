import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { Secret } from '@adonisjs/core/helpers'
import { defineConfig } from '@adonisjs/core/http'

/**
 * The app key is used for encrypting cookies, generating signed URLs,
 * and by the "encryption" module.
 *
 * The encryption module will fail to decrypt data if the key is lost or
 * changed. Therefore it is recommended to keep the app key secure.
 */
export const appKey = new Secret(env.get('APP_KEY'))

/**
 * The configuration settings used by the HTTP server
 */
export const http = defineConfig({
  generateRequestId: true,

  /**
   * Confia nos headers X-Forwarded-* SOMENTE quando vêm de um proxy em IP
   * privado/loopback (o Traefik do Coolify, na rede docker). Sem isso, request.ip()
   * retorna o IP do proxy e o rate-limit/firewall por IP ficam inúteis; com `true`
   * irrestrito, um atacante direto poderia forjar o IP. Esta checagem é segura
   * mesmo com a porta publicada.
   */
  trustProxy: (address: string) =>
    address === '127.0.0.1' ||
    address === '::1' ||
    /^10\./.test(address) ||
    /^192\.168\./.test(address) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(address) ||
    /^::ffff:(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address) ||
    /^(fc|fd|fe80)/i.test(address),

  // Habilitado: os formulários de edição do painel enviam POST + ?_method=PUT
  // (padrão do Inertia quando há upload de arquivo/FormData). Sem isso, todas as
  // edições com arquivo caíam em 404.
  allowMethodSpoofing: true,

  /**
   * Enabling async local storage will let you access HTTP context
   * from anywhere inside your application.
   */
  useAsyncLocalStorage: false,

  /**
   * Manage cookies configuration. The settings for the session id cookie are
   * defined inside the "config/session.ts" file.
   */
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },
})
