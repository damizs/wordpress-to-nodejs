import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Page, { type PageBlock } from '#models/page'
import { generateSlug } from '#helpers/slug'
import { sanitizeRichHtml, sanitizePlainText } from '#helpers/sanitize_html'
import TrashService from '#services/trash_service'

/**
 * Slugs que nunca podem ser usados por uma Página: colidem com rotas
 * registradas do portal (ou com o próprio painel/api).
 */
const RESERVED_SLUGS = new Set([
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
])

const BLOCK_TYPES = new Set([
  'heading',
  'text',
  'image',
  'documents',
  'accordion',
  'callout',
  'buttons',
  'video',
  'columns',
])

/** Garante que `blocks` vindo do form é um array de blocos com tipos conhecidos. */
export function sanitizeBlocks(raw: unknown): PageBlock[] | null {
  let value = raw
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value)
    } catch {
      return null
    }
  }
  if (!Array.isArray(value)) return null
  const blocks = value
    .filter(
      (b): b is PageBlock =>
        b !== null && typeof b === 'object' && BLOCK_TYPES.has((b as { type?: string }).type ?? '')
    )
    .map((block) => sanitizeBlock(block))
    .filter((block): block is PageBlock => block !== null)
  return blocks.length > 0 ? blocks : null
}

function isSafeUrl(value: unknown) {
  const url = String(value || '').trim()
  if (!url) return false
  if (url.startsWith('/')) return !url.toLowerCase().split('?')[0].endsWith('.svg')
  try {
    const parsed = new URL(url)
    return (
      ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol) &&
      !parsed.pathname.toLowerCase().endsWith('.svg')
    )
  } catch {
    return false
  }
}

function sanitizeBlock(block: PageBlock): PageBlock | null {
  switch (block.type) {
    case 'heading':
      return { type: 'heading', text: sanitizePlainText(block.text) }
    case 'text':
      return { type: 'text', text: sanitizeRichHtml(block.text) }
    case 'image':
      if (!isSafeUrl(block.url)) return null
      return {
        type: 'image',
        url: String(block.url).trim(),
        caption: block.caption ? sanitizePlainText(block.caption) : undefined,
        full: Boolean(block.full),
      }
    case 'documents':
      return {
        type: 'documents',
        items: (block.items || [])
          .filter((item) => isSafeUrl(item.url))
          .map((item) => ({ label: sanitizePlainText(item.label), url: String(item.url).trim() })),
      }
    case 'accordion':
      return {
        type: 'accordion',
        items: (block.items || []).map((item) => ({
          title: sanitizePlainText(item.title),
          body: sanitizeRichHtml(item.body),
        })),
      }
    case 'callout':
      return { type: 'callout', tone: block.tone, text: sanitizeRichHtml(block.text) }
    case 'buttons':
      return {
        type: 'buttons',
        items: (block.items || [])
          .filter((item) => isSafeUrl(item.url))
          .map((item) => ({
            label: sanitizePlainText(item.label),
            url: String(item.url).trim(),
            variant: item.variant === 'secondary' ? 'secondary' : 'primary',
          })),
      }
    case 'video':
      return isSafeUrl(block.url) ? { type: 'video', url: String(block.url).trim() } : null
    case 'columns': {
      // Layout multi-coluna: sanitiza recursivamente cada coluna; não permite
      // colunas aninhadas (evita recursão e mantém o editor previsível).
      const allowed = ['1-1', '1-2', '2-1', '1-1-1']
      const anyBlock = block as unknown as { layout?: unknown; columns?: unknown }
      const layout = allowed.includes(String(anyBlock.layout)) ? String(anyBlock.layout) : '1-1'
      const columns = (Array.isArray(anyBlock.columns) ? anyBlock.columns : []).map((col) =>
        (Array.isArray(col) ? col : [])
          .filter(
            (b: unknown): b is PageBlock =>
              b !== null &&
              typeof b === 'object' &&
              BLOCK_TYPES.has((b as { type?: string }).type ?? '') &&
              (b as { type?: string }).type !== 'columns'
          )
          .map((b) => sanitizeBlock(b))
          .filter((b): b is PageBlock => b !== null)
      )
      return { type: 'columns', layout, columns } as unknown as PageBlock
    }
    default:
      return null
  }
}

export default class PagesController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    let query = Page.query().whereNull('deleted_at').orderBy('updated_at', 'desc')
    if (search) {
      query = query.where((q) => {
        q.whereILike('title', `%${search}%`).orWhereILike('slug', `%${search}%`)
      })
    }

    const pages = await query.paginate(page, 15)
    return inertia.render('admin/pages/index', {
      pages: pages.serialize(),
      filters: { search },
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/pages/form', { page: null })
  }

  async store(ctx: HttpContext) {
    const { request, response, session } = ctx
    const result = await this.validate(ctx, null)
    if (!result) return response.redirect().back()

    const { slug, data } = result
    const isPublished = this.toBool(data.is_published)

    await Page.create({
      title: data.title,
      slug,
      content: sanitizeRichHtml(data.content),
      blocks: sanitizeBlocks(request.input('blocks')),
      heroSubtitle: data.hero_subtitle || null,
      metaDescription: data.meta_description || null,
      isPublished,
      publishedAt: isPublished ? DateTime.now() : null,
    })

    session.flash('success', 'Página criada com sucesso!')
    return response.redirect('/painel/paginas')
  }

  async edit({ params, inertia }: HttpContext) {
    const page = await Page.findOrFail(params.id)
    return inertia.render('admin/pages/form', { page: page.serialize() })
  }

  async update(ctx: HttpContext) {
    const { params, request, response, session } = ctx
    const page = await Page.findOrFail(params.id)
    const result = await this.validate(ctx, page.id)
    if (!result) return response.redirect().back()

    const { slug, data } = result
    const isPublished = this.toBool(data.is_published)

    page.title = data.title
    page.slug = slug
    page.content = sanitizeRichHtml(data.content)
    page.blocks = sanitizeBlocks(request.input('blocks'))
    page.heroSubtitle = data.hero_subtitle || null
    page.metaDescription = data.meta_description || null
    if (isPublished && !page.isPublished) page.publishedAt = DateTime.now()
    if (isPublished && !page.publishedAt) page.publishedAt = DateTime.now()
    page.isPublished = isPublished
    await page.save()

    session.flash('success', 'Página atualizada!')
    return response.redirect('/painel/paginas')
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session } = ctx
    const page = await Page.findOrFail(params.id)
    await TrashService.moveToTrash(page, ctx, {
      displayName: page.title,
      resource: 'pagina',
    })
    session.flash('success', 'Página movida para a lixeira.')
    return response.redirect('/painel/paginas')
  }

  /* ============================== privados ============================== */

  private toBool(value: unknown): boolean {
    return value === true || value === 'true' || value === '1' || value === 1
  }

  /**
   * Valida título e slug (auto a partir do título, único, fora da lista de
   * rotas reservadas). Em caso de erro, flasha em `errors` (Inertia mantém o
   * estado do formulário) e retorna null.
   */
  private async validate({ request, session }: HttpContext, ignoreId: number | null) {
    const data = request.only([
      'title',
      'slug',
      'content',
      'hero_subtitle',
      'meta_description',
      'is_published',
    ])

    const errors: Record<string, string> = {}

    if (!data.title || !String(data.title).trim()) {
      errors.title = 'Informe o título da página.'
    }

    const slug = generateSlug(String(data.slug || data.title || ''))
    if (!slug) {
      errors.slug = 'Não foi possível gerar um slug válido.'
    } else if (RESERVED_SLUGS.has(slug)) {
      errors.slug = `O slug "${slug}" é reservado por uma rota do portal. Escolha outro.`
    } else {
      let existsQuery = Page.query().where('slug', slug).whereNull('deleted_at')
      if (ignoreId) existsQuery = existsQuery.whereNot('id', ignoreId)
      if (await existsQuery.first()) {
        errors.slug = `Já existe uma página com o slug "${slug}".`
      }
    }

    if (Object.keys(errors).length > 0) {
      session.flashErrors(errors)
      return null
    }

    return { slug, data }
  }
}
