import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import SiteSetting from '#models/site_setting'
import { getPublicAccessBlock } from '#helpers/public_access'

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

function shouldCheckPublicAccess(ctx: HttpContext) {
  const method = ctx.request.method()
  if (method !== 'GET' && method !== 'HEAD') return false

  const path = ctx.request.url().split('?')[0]
  if (!path || path === '/') return false
  if (EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return false
  if (EXCLUDED_EXTENSIONS.some((extension) => path.toLowerCase().endsWith(extension))) return false

  return true
}

export default class PublicAccessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!shouldCheckPublicAccess(ctx)) return next()

    const settings = await SiteSetting.allAsObject()
    const block = getPublicAccessBlock(settings, ctx.request.url())
    if (!block) return next()

    ctx.response.status(200)
    return ctx.inertia.render('public/unavailable', {
      ...block,
      siteSettings: settings,
    })
  }
}
