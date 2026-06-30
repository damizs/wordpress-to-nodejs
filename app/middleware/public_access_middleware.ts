import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import SiteSetting from '#models/site_setting'
import {
  getPublicAccessBlock,
  getMaintenanceBlock,
  isMaintenanceModeOn,
} from '#helpers/public_access'

const EXCLUDED_PREFIXES = [
  '/painel',
  '/login',
  '/api',
  '/health',
  '/assets',
  '/uploads',
  '/build',
  '/favicon',
  '/robots.txt',
  '/sitemap.xml',
]

const EXCLUDED_EXTENSIONS = ['.css', '.js', '.map', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.xml', '.txt', '.json', '.csv']

/**
 * Nome do cookie da sessão (config/session.ts) e chave onde o guard padrão
 * ('web', config/auth.ts) grava o id do usuário logado (`auth_${guard}`).
 */
const SESSION_COOKIE_NAME = 'adonis-session'
const WEB_GUARD_SESSION_KEY = 'auth_web'

/**
 * Requisições que NUNCA passam pelos guards públicos (manutenção ou bloqueio de
 * área): painel, login, API, health, assets/uploads, estáticos e métodos não-GET.
 * NÃO exclui a home `/` — o modo de manutenção precisa derrubar o site inteiro,
 * inclusive a página inicial (o bloqueio de área é que ignora a home, logo abaixo).
 */
function isExcludedFromPublicGuards(ctx: HttpContext) {
  const method = ctx.request.method()
  if (method !== 'GET' && method !== 'HEAD') return true

  const path = ctx.request.url().split('?')[0]
  if (!path) return true
  if (EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return true
  if (EXCLUDED_EXTENSIONS.some((extension) => path.toLowerCase().endsWith(extension))) return true

  return false
}

/**
 * Detecta um usuário autenticado SEM depender de `ctx.auth`.
 *
 * Este middleware roda no *server stack* (start/kernel.ts), ANTES do
 * `initialize_auth_middleware`/`session_middleware` (router stack), então
 * `ctx.auth` e `ctx.session` ainda não existem aqui. Como o `SESSION_DRIVER` é
 * `cookie`, os dados da sessão ficam num cookie criptografado nomeado pelo id da
 * sessão; o guard 'web' grava o id do usuário logado sob a chave `auth_web`.
 * Lemos isso direto dos cookies. Qualquer falha => trata como NÃO autenticado
 * (fail-safe: visitante anônimo vê a manutenção).
 */
function hasAuthenticatedSession(ctx: HttpContext): boolean {
  try {
    const sessionId = ctx.request.cookie(SESSION_COOKIE_NAME)
    if (!sessionId || typeof sessionId !== 'string') return false

    const data = ctx.request.encryptedCookie(sessionId)
    if (!data || typeof data !== 'object') return false

    return Boolean((data as Record<string, unknown>)[WEB_GUARD_SESSION_KEY])
  } catch {
    return false
  }
}

export default class PublicAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (isExcludedFromPublicGuards(ctx)) return next()

    const settings = await SiteSetting.allAsObject()

    // 1) Modo de manutenção — PRECEDÊNCIA sobre os bloqueios granulares de área.
    //    Derruba TODO o site público (inclusive a home), mas usuários logados
    //    (admins) continuam vendo o site real para revisar enquanto consertam.
    if (isMaintenanceModeOn(settings)) {
      if (hasAuthenticatedSession(ctx)) return next()

      const maintenance = getMaintenanceBlock(settings)
      ctx.response.status(503)
      return ctx.inertia.render('public/maintenance', {
        title: maintenance.title,
        message: maintenance.message,
        isMaintenance: true,
        siteSettings: settings,
      })
    }

    // 2) Bloqueios granulares de área (comportamento existente preservado). A home
    //    nunca é uma área bloqueada, então segue passando direto.
    const path = ctx.request.url().split('?')[0]
    if (!path || path === '/') return next()

    const block = getPublicAccessBlock(settings, ctx.request.url())
    if (!block) return next()

    ctx.response.status(200)
    return ctx.inertia.render('public/unavailable', {
      ...block,
      siteSettings: settings,
    })
  }
}
