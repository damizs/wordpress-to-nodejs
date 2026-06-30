import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import News from '#models/news'
import NewsCategory from '#models/news_category'
import Page, { type PageBlock } from '#models/page'
import User from '#models/user'
import { sanitizePlainText, sanitizeRichHtml } from '#helpers/sanitize_html'
import { generateSlug } from '#helpers/slug'
import { camara } from '#config/camara'

// Autor padrão das notícias/legado importados: o usuário admin semeado.
// Parametrizável p/ outras câmaras via env; default = admin de Sumé (sem mudança).
const IMPORT_ADMIN_EMAIL = process.env.WP_IMPORT_ADMIN_EMAIL || 'admin@camaradesume.pb.gov.br'

interface WpCategory {
  name: string
  slug: string
}

interface WpItem {
  wpId: number
  title: string
  slug: string
  status: string
  date: string | null
  modified: string | null
  excerpt: string
  content: string
  coverPath: string | null
  assetPaths: string[]
  categories?: WpCategory[]
  elementorData?: string | null
  pageTemplate?: string | null
}

interface WpLegacyData {
  generatedAt: string
  totals?: {
    posts?: number
    pages?: number
    attachments?: number
    assetPaths?: number
  }
  posts: WpItem[]
  pages: WpItem[]
  assetPaths?: string[]
}

interface Logger {
  info: (m: string) => void
  success: (m: string) => void
  warning: (m: string) => void
  error: (m: string) => void
}

const consoleLogger: Logger = {
  info: (m) => console.log(m),
  success: (m) => console.log(m),
  warning: (m) => console.warn(m),
  error: (m) => console.error(m),
}

const RESERVED_PAGE_SLUGS = new Set([
  'noticias',
  'transparencia',
  'licitacoes',
  'vereadores',
  'atas',
  'pautas',
  'painel',
  'ouvidoria',
  'comissoes',
  'votacoes',
  'publicacoes-oficiais',
  'diario-oficial',
  'perguntas-frequentes',
  'sobre',
  'historia-da-camara',
  'mesa-diretora',
  'politica-de-privacidade',
  'pesquisa-de-satisfacao',
  'atividades-legislativas',
  'atividades-legislativa',
  'leis',
  'login',
  'api',
  'health',
  'acesso-a-informacao',
  'esic',
  'duodecimos',
  'relatorios-fiscais',
  'videos',
  'agenda',
  'dados-abertos',
  'busca',
])

const TECHNICAL_PAGE_SLUGS = new Set([
  'account-2',
  'atendimento',
  'dashboard',
  'edit-profile',
  'envia-sms',
  'log-in',
  'meus-tickets',
  'register',
  'restricao',
  'segue_atendimento',
  'thank-you',
  'user',
])

function normalizeSlug(value: string, fallback: string): string {
  const slug = generateSlug(value || fallback)
  return slug || generateSlug(fallback) || `wp-${Date.now()}`
}

function localUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null
  const clean = safeDecode(String(path)).replace(/^\/+/, '').replace(/\\/g, '/')
  if (!clean || clean.includes('..')) return null
  return `/uploads/wp-migration/${clean}`
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function localUploadExists(path: string | null | undefined): boolean {
  if (!path) return false
  const clean = safeDecode(String(path)).replace(/^\/+/, '').replace(/\\/g, '/')
  if (!clean || clean.includes('..')) return false
  return existsSync(join(app.publicPath(), 'uploads', 'wp-migration', ...clean.split('/')))
}

function rewriteUploadUrls(html: string): string {
  if (!html) return ''
  return html
    .replace(
      /https?:\/\/[^"'()\s<>]+\/wp-content\/uploads\/([^"'()\s<>]+)/gi,
      (full, path) => {
        const clean = path.split(/[?#]/)[0]
        return localUploadExists(clean) ? localUploadUrl(clean) || full : full
      }
    )
    .replace(
      /(["'(])\/?wp-content\/uploads\/([^"'()\s<>]+)/gi,
      (_full, quote, path) => {
        const clean = path.split(/[?#]/)[0]
        const fallback = `https://${camara.wpSourceDomain}/wp-content/uploads/${clean}`
        return `${quote}${localUploadExists(clean) ? localUploadUrl(clean) || fallback : fallback}`
      }
    )
}

function toDateTime(value: string | null | undefined): DateTime | null {
  if (!value) return null
  const sql = DateTime.fromSQL(value, { zone: 'America/Sao_Paulo' })
  if (sql.isValid) return sql
  const iso = DateTime.fromISO(value, { zone: 'America/Sao_Paulo' })
  return iso.isValid ? iso : null
}

function stripHtml(value: string): string {
  return sanitizePlainText(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function shortExcerpt(item: WpItem): string | null {
  const excerpt = stripHtml(item.excerpt || '')
  if (excerpt) return excerpt.slice(0, 400)
  const fromContent = stripHtml(item.content || '')
  return fromContent ? fromContent.slice(0, 400) : null
}

function parseElementorText(raw: string | null | undefined): string {
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw)
    const chunks: string[] = []
    const wanted = new Set([
      'title',
      'editor',
      'text',
      'description',
      'content',
      'html',
      'button_text',
      'heading',
      'caption',
    ])

    const walk = (value: unknown, key = '') => {
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed && wanted.has(key) && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
          chunks.push(trimmed)
        }
        return
      }
      if (Array.isArray(value)) {
        value.forEach((item) => walk(item))
        return
      }
      if (value && typeof value === 'object') {
        for (const [childKey, childValue] of Object.entries(value)) walk(childValue, childKey)
      }
    }

    walk(parsed)
    return chunks
      .map((chunk) => (/<[a-z][\s\S]*>/i.test(chunk) ? chunk : `<p>${sanitizePlainText(chunk)}</p>`))
      .join('\n')
  } catch {
    return ''
  }
}

function pageContent(item: WpItem): string {
  const content = rewriteUploadUrls(item.content || '')
  if (stripHtml(content)) return sanitizeRichHtml(content)
  const elementor = rewriteUploadUrls(parseElementorText(item.elementorData))
  if (stripHtml(elementor)) return sanitizeRichHtml(elementor)
  return ''
}

function isPublicLegacyPage(item: WpItem, slug: string): boolean {
  if (item.status !== 'publish') return false
  if (RESERVED_PAGE_SLUGS.has(item.slug) || RESERVED_PAGE_SLUGS.has(slug)) return false
  if (TECHNICAL_PAGE_SLUGS.has(item.slug) || TECHNICAL_PAGE_SLUGS.has(slug)) return false
  if (/^sample-page/.test(item.slug)) return false
  if (!stripHtml(item.content || '') && !stripHtml(parseElementorText(item.elementorData))) return false
  return true
}

async function categoryFor(item: WpItem, fallback: NewsCategory): Promise<NewsCategory> {
  const category = (item.categories || []).find((c) => c.slug && c.slug !== 'sem-categoria')
  if (!category) return fallback
  return NewsCategory.updateOrCreate(
    { slug: normalizeSlug(category.slug, category.name) },
    { name: sanitizePlainText(category.name) || 'Noticias', slug: normalizeSlug(category.slug, category.name) }
  )
}

async function importNewsItem(item: WpItem, fallbackCategory: NewsCategory, authorId: number | null) {
  const category = await categoryFor(item, fallbackCategory)
  const slug = normalizeSlug(item.slug, item.title || `wp-${item.wpId}`)
  const publishedAt = toDateTime(item.date) || toDateTime(item.modified) || DateTime.now()
  const content = sanitizeRichHtml(rewriteUploadUrls(item.content || ''))
  const fields = {
    title: sanitizePlainText(item.title) || `Noticia WordPress ${item.wpId}`,
    slug,
    excerpt: shortExcerpt(item),
    content: content || '<p>Conteudo legado importado do WordPress.</p>',
    coverImageUrl: localUploadExists(item.coverPath) ? localUploadUrl(item.coverPath) : null,
    status: 'published' as const,
    publishedAt,
    categoryId: category.id,
    authorId,
  }

  const existing = await News.findBy('slug', slug)
  if (existing) {
    existing.merge(fields)
    await existing.save()
    return 'updated' as const
  }

  await News.create({ ...fields, viewsCount: 0 })
  return 'created' as const
}

async function importPageItem(item: WpItem) {
  const baseSlug = normalizeSlug(item.slug, item.title || `wp-${item.wpId}`)
  const slug =
    RESERVED_PAGE_SLUGS.has(baseSlug) || TECHNICAL_PAGE_SLUGS.has(baseSlug)
      ? `legado-${baseSlug}`
      : baseSlug
  const content = pageContent(item)
  const isPublished = isPublicLegacyPage(item, slug)
  const blocks: PageBlock[] | null = content ? [{ type: 'text', text: content }] : null
  const title = sanitizePlainText(item.title) || `Pagina WordPress ${item.wpId}`
  const fields = {
    title,
    slug,
    content,
    blocks,
    heroSubtitle: null,
    metaDescription: stripHtml(content).slice(0, 160) || null,
    isPublished,
    publishedAt: isPublished
      ? toDateTime(item.date) || toDateTime(item.modified) || DateTime.now()
      : null,
  }

  const existing = await Page.findBy('slug', slug)
  if (existing) {
    existing.merge(fields)
    await existing.save()
    return isPublished ? ('updated_public' as const) : ('updated_legacy' as const)
  }

  await Page.create(fields)
  return isPublished ? ('created_public' as const) : ('created_legacy' as const)
}

export async function importWpLegacyContent(
  opts: { logger?: Logger; dryRun?: boolean } = {}
): Promise<{
  skippedFile?: boolean
  posts: number
  pages: number
  newsCreated: number
  newsUpdated: number
  pagesPublic: number
  pagesLegacy: number
  uploadReferences: number
}> {
  const logger = opts.logger ?? consoleLogger
  const path = app.makePath('database', 'wp_legacy_content.json')
  if (!existsSync(path)) {
    logger.warning('wp_legacy_content.json nao encontrado; pulando acervo legado.')
    return {
      skippedFile: true,
      posts: 0,
      pages: 0,
      newsCreated: 0,
      newsUpdated: 0,
      pagesPublic: 0,
      pagesLegacy: 0,
      uploadReferences: 0,
    }
  }

  const data = JSON.parse(readFileSync(path, 'utf-8')) as WpLegacyData
  logger.info(
    `\n=== Acervo legado WordPress: ${data.posts.length} posts, ${data.pages.length} paginas ===`
  )

  if (opts.dryRun) {
    return {
      posts: data.posts.length,
      pages: data.pages.length,
      newsCreated: 0,
      newsUpdated: 0,
      pagesPublic: 0,
      pagesLegacy: 0,
      uploadReferences: data.assetPaths?.length || data.totals?.assetPaths || 0,
    }
  }

  const fallbackCategory = await NewsCategory.updateOrCreate(
    { slug: 'noticias' },
    { name: 'Noticias', slug: 'noticias' }
  )
  const admin = await User.findBy('email', IMPORT_ADMIN_EMAIL)

  let newsCreated = 0
  let newsUpdated = 0
  for (const item of data.posts) {
    try {
      const result = await importNewsItem(item, fallbackCategory, admin?.id || null)
      if (result === 'created') newsCreated++
      else newsUpdated++
    } catch (error) {
      logger.warning(
        `  noticia ignorada (${item.wpId}): ${error instanceof Error ? error.message : error}`
      )
    }
  }

  let pagesPublic = 0
  let pagesLegacy = 0
  for (const item of data.pages) {
    try {
      const result = await importPageItem(item)
      if (result.endsWith('_public')) pagesPublic++
      else pagesLegacy++
    } catch (error) {
      logger.warning(
        `  pagina ignorada (${item.wpId}): ${error instanceof Error ? error.message : error}`
      )
    }
  }

  logger.success(
    `  noticias: ${newsCreated} criadas, ${newsUpdated} atualizadas; paginas livres: ${pagesPublic}; legado preservado: ${pagesLegacy}`
  )

  return {
    posts: data.posts.length,
    pages: data.pages.length,
    newsCreated,
    newsUpdated,
    pagesPublic,
    pagesLegacy,
    uploadReferences: data.assetPaths?.length || data.totals?.assetPaths || 0,
  }
}
