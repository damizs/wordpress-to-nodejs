import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import SiteSetting from '#models/site_setting'

/**
 * Compartilha dados do servidor com o template edge raiz (rootView do Inertia)
 * ANTES do primeiro paint. Hoje serve para renderizar o favicon enviado no
 * painel (Aparência → favicon_url) já no <head> do HTML inicial, sem depender
 * do swap client-side (que disputa cache com o /favicon.ico estático).
 *
 * Como funciona: o renderer do Inertia usa `ctx.view.render(...)` e o
 * `ctx.view` é um getter cacheado (singleton por request) do HttpContext, então
 * `ctx.view.share(...)` aqui chega ao edge no momento do render (SSR e client).
 */

const FAVICON_CACHE_TTL = 60_000

// Cache em memória curto para não bater no banco a cada request. O próprio
// SiteSetting.getValue já cacheia ~60s; este é um reforço local barato.
let faviconCache: { expiresAt: number; value: string | null } | null = null

/** Hash estável (djb2) — usado como cache-buster determinístico por URL. */
function stableHash(input: string): string {
  let h = 5381
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i)
  }
  return (h >>> 0).toString(36)
}

/** Tipo MIME a partir da extensão (default png). */
function faviconType(url: string): string {
  const clean = (url.split('?')[0] || '').toLowerCase()
  if (clean.endsWith('.ico')) return 'image/x-icon'
  if (clean.endsWith('.svg')) return 'image/svg+xml'
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg'
  if (clean.endsWith('.gif')) return 'image/gif'
  return 'image/png'
}

/** Acrescenta um cache-buster estável (?v=hash) preservando query existente. */
function withBuster(url: string): string {
  return url + (url.includes('?') ? '&' : '?') + 'v=' + stableHash(url)
}

async function readFaviconUrl(): Promise<string | null> {
  const cached = faviconCache
  if (cached && cached.expiresAt > Date.now()) return cached.value

  let value: string | null = null
  try {
    value = await SiteSetting.getValue('favicon_url')
  } catch {
    value = null
  }
  faviconCache = { value, expiresAt: Date.now() + FAVICON_CACHE_TTL }
  return value
}

export default class ShareViewDataMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const path = ctx.request.url()

    // Liveness e estáticos NÃO podem depender do banco (boot frio quebraria o
    // healthcheck do deploy) e nem renderizam edge — passa direto.
    if (path === '/health' || path.startsWith('/assets/') || path.startsWith('/uploads/')) {
      return next()
    }

    try {
      const raw = await readFaviconUrl()
      const url = raw && raw.trim() ? raw.trim() : null
      // ctx.view é provido pelo edge_provider (sempre disponível). Compartilha
      // SEMPRE (null quando não há favicon) para a variável existir no edge.
      ctx.view?.share({
        faviconUrl: url ? withBuster(url) : null,
        faviconType: url ? faviconType(url) : null,
      })
    } catch {
      // Nunca derrubar a request porque o favicon não pôde ser compartilhado.
    }

    return next()
  }
}
