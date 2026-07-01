import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import SiteSetting from '#models/site_setting'
import { camara } from '#config/camara'

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

function hexToHslParts(hex: string | null | undefined): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim())
  if (!result) return null

  const r = Number.parseInt(result[1], 16) / 255
  const g = Number.parseInt(result[2], 16) / 255
  const b = Number.parseInt(result[3], 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hsl(p: { h: number; s: number; l: number }, deltaL = 0): string {
  return `${p.h} ${p.s}% ${Math.min(100, Math.max(0, p.l + deltaL))}%`
}

function earlyThemeStyle(settings: Record<string, string | null>): string | null {
  const navy = hexToHslParts(settings.color_navy)
  const gold = hexToHslParts(settings.color_gold)
  const sky = hexToHslParts(settings.color_sky)
  if (!navy && !gold && !sky) return null

  const rootVars: string[] = []
  const lightVars: string[] = []
  const darkVars: string[] = []

  if (navy) {
    rootVars.push(`--navy: ${hsl(navy)}`)
    rootVars.push(`--navy-dark: ${hsl(navy, -9)}`)
    rootVars.push(`--navy-light: ${hsl(navy, 14)}`)
    lightVars.push(`--primary: ${hsl(navy)}`)
    darkVars.push(`--primary: ${navy.h} ${Math.min(80, Math.max(navy.s, 50))}% ${Math.max(navy.l, 45)}%`)
  }
  if (gold) {
    rootVars.push(`--gold: ${hsl(gold)}`)
    rootVars.push(`--gold-light: ${hsl(gold, 13)}`)
  }
  if (sky) rootVars.push(`--sky: ${hsl(sky)}`)

  return [
    rootVars.length ? `html:not(.high-contrast){${rootVars.join(';')}}` : '',
    lightVars.length ? `html:not(.dark):not(.high-contrast){${lightVars.join(';')}}` : '',
    darkVars.length ? `html.dark:not(.high-contrast){${darkVars.join(';')}}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

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

    // Identidade da câmara (config/camara) disponível no edge raiz para SEO/OG/
    // structured data já no 1º paint. É config pura (sem DB), então compartilha
    // SEMPRE — DEFAULT = Sumé, logo o HTML de Sumé fica idêntico.
    try {
      ctx.view?.share({
        camara: {
          nome: camara.nome,
          nomeCurto: camara.nomeCurto,
          cidade: camara.cidade,
          uf: camara.uf,
          baseUrl: camara.baseUrl,
          siteUrl: camara.siteUrl,
        },
      })
    } catch {
      // Nunca derrubar a request por causa da identidade compartilhada.
    }

    try {
      const [raw, settings] = await Promise.all([readFaviconUrl(), SiteSetting.allAsObject()])
      const url = raw && raw.trim() ? raw.trim() : null
      const layoutStyle = settings.layout_style?.trim() || 'institucional'
      const siteTemplate = settings.site_template?.trim() || 'institucional'
      // ctx.view é provido pelo edge_provider (sempre disponível). Compartilha
      // SEMPRE (null quando não há favicon) para a variável existir no edge.
      ctx.view?.share({
        faviconUrl: url ? withBuster(url) : null,
        faviconType: url ? faviconType(url) : null,
        earlyThemeStyle: earlyThemeStyle(settings),
        earlyThemeColor: settings.color_navy?.trim() || '#1a2332',
        earlyLayoutStyle: layoutStyle,
        earlySiteTemplate: siteTemplate,
      })
    } catch {
      // Nunca derrubar a request porque o favicon não pôde ser compartilhado.
    }

    return next()
  }
}
