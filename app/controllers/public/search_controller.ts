import type { HttpContext } from '@adonisjs/core/http'
import News from '#models/news'
import Ata from '#models/ata'
import Pauta from '#models/pauta'
import Licitacao from '#models/licitacao'
import OfficialPublication from '#models/official_publication'
import LegislativeActivity from '#models/legislative_activity'
import Councilor from '#models/councilor'
import Page from '#models/page'
import FaqItem from '#models/faq_item'
import SiteSetting from '#models/site_setting'

type ResultType =
  | 'Notícia'
  | 'Ata'
  | 'Pauta'
  | 'Licitação'
  | 'Publicação'
  | 'Atividade'
  | 'Vereador'
  | 'Página'
  | 'FAQ'

interface SearchResult {
  type: ResultType
  title: string
  excerpt: string
  url: string
  date?: string | null
}

const PER_TYPE = 6

/** Remove HTML, colapsa espaços e corta um trecho curto em torno do termo buscado. */
function makeExcerpt(raw: string | null | undefined, term: string, length = 180): string {
  if (!raw) return ''
  const text = String(raw)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return ''
  const idx = text.toLowerCase().indexOf(term.toLowerCase())
  if (idx <= 0) return text.length > length ? text.slice(0, length).trimEnd() + '…' : text
  // Centraliza um pouco o trecho ao redor da ocorrência
  const start = Math.max(0, idx - 40)
  const slice = text.slice(start, start + length).trim()
  return (start > 0 ? '…' : '') + slice + (start + length < text.length ? '…' : '')
}

function textOnly(raw: string | null | undefined): string {
  return String(raw || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function like(term: string) {
  return `%${term}%`
}

export default class SearchController {
  async index({ request, inertia }: HttpContext) {
    const q = String(request.input('q', '') || '').trim()
    const siteSettings = await SiteSetting.allAsObject()

    // Termo muito curto: devolve estado vazio sem consultar o banco
    if (q.length < 2) {
      return inertia.render('public/search/index', {
        q,
        results: [],
        total: 0,
        byType: {},
        siteSettings,
      })
    }

    const term = like(q)

    const [
      news,
      atas,
      pautas,
      licitacoes,
      publications,
      activities,
      councilors,
      pages,
      faqs,
    ] = await Promise.all([
      // Notícias publicadas
      News.query()
        .where('status', 'published')
        .where((sub) => {
          sub
            .whereILike('title', term)
            .orWhereILike('excerpt', term)
            .orWhereILike('content', term)
        })
        .orderBy('published_at', 'desc')
        .limit(PER_TYPE),

      // Atas publicadas (título / conteúdo)
      Ata.query()
        .where('is_published', true)
        .where((sub) => {
          sub.whereILike('title', term).orWhereILike('content', term)
        })
        .orderBy('document_date', 'desc')
        .limit(PER_TYPE),

      // Pautas publicadas (título / conteúdo)
      Pauta.query()
        .where('is_published', true)
        .where((sub) => {
          sub.whereILike('title', term).orWhereILike('content', term)
        })
        .orderBy('document_date', 'desc')
        .limit(PER_TYPE),

      // Licitações ativas
      Licitacao.query()
        .where('is_active', true)
        .where((sub) => {
          sub
            .whereILike('title', term)
            .orWhereILike('object', term)
            .orWhereILike('number', term)
        })
        .orderBy('created_at', 'desc')
        .limit(PER_TYPE),

      // Publicações oficiais
      OfficialPublication.query()
        .where((sub) => {
          sub
            .whereILike('title', term)
            .orWhereILike('description', term)
            .orWhereILike('number', term)
        })
        .orderBy('publication_date', 'desc')
        .limit(PER_TYPE),

      // Atividades legislativas ativas
      LegislativeActivity.query()
        .where('is_active', true)
        .where((sub) => {
          sub
            .whereILike('title', term)
            .orWhereILike('summary', term)
            .orWhereILike('number', term)
        })
        .orderBy('year', 'desc')
        .limit(PER_TYPE),

      // Vereadores ativos
      Councilor.query()
        .where('is_active', true)
        .where((sub) => {
          sub
            .whereILike('name', term)
            .orWhereILike('parliamentary_name', term)
            .orWhereILike('bio', term)
        })
        .orderBy('display_order', 'asc')
        .limit(PER_TYPE),

      // Páginas publicadas (módulo Páginas estilo WordPress)
      Page.query()
        .where('is_published', true)
        .where((sub) => {
          sub.whereILike('title', term).orWhereILike('content', term)
        })
        .orderBy('title', 'asc')
        .limit(PER_TYPE),

      // FAQ ativo
      FaqItem.query()
        .where('is_active', true)
        .where((sub) => {
          sub.whereILike('question', term).orWhereILike('answer', term)
        })
        .orderBy('display_order', 'asc')
        .limit(PER_TYPE),
    ])

    const results: SearchResult[] = []

    for (const n of news) {
      results.push({
        type: 'Notícia',
        title: n.title,
        excerpt: makeExcerpt(n.excerpt || n.content, q),
        url: `/noticias/${n.slug}`,
        date: n.publishedAt ? n.publishedAt.toISODate() : null,
      })
    }

    for (const a of atas) {
      results.push({
        type: 'Ata',
        title: a.title,
        excerpt: makeExcerpt(a.content, q),
        url: a.slug ? `/atas/${a.slug}` : '/atas',
        date: a.documentDate,
      })
    }

    for (const p of pautas) {
      results.push({
        type: 'Pauta',
        title: p.title,
        excerpt: makeExcerpt(p.content, q),
        url: p.slug ? `/pautas/${p.slug}` : '/pautas',
        date: p.documentDate,
      })
    }

    for (const l of licitacoes) {
      results.push({
        type: 'Licitação',
        title: l.number ? `${l.title} (nº ${l.number})` : l.title,
        excerpt: makeExcerpt(l.object || l.content, q),
        url: `/licitacoes/${l.slug}`,
        date: l.openingDate,
      })
    }

    for (const p of publications) {
      results.push({
        type: 'Publicação',
        title: p.number ? `${p.title} (nº ${p.number})` : p.title,
        excerpt: makeExcerpt(p.description, q),
        url: p.slug ? `/publicacoes-oficiais/${p.slug}` : '/publicacoes-oficiais',
        date: p.publicationDate,
      })
    }

    for (const act of activities) {
      results.push({
        type: 'Atividade',
        title: act.title || `${act.type} nº ${act.number}/${act.year}`,
        excerpt: makeExcerpt(act.summary, q),
        url: act.slug ? `/atividades-legislativas/${act.slug}` : '/atividades-legislativas',
        date: act.sessionDate,
      })
    }

    for (const c of councilors) {
      results.push({
        type: 'Vereador',
        title: c.parliamentaryName || c.name,
        excerpt: makeExcerpt(c.bio, q) || (c.party ? `Partido: ${c.party}` : ''),
        url: `/vereadores/${c.slug}`,
        date: null,
      })
    }

    for (const pg of pages) {
      results.push({
        type: 'Página',
        title: pg.title,
        excerpt: makeExcerpt(pg.metaDescription || pg.content, q),
        url: `/${pg.slug}`,
        date: null,
      })
    }

    for (const f of faqs.filter((item) => textOnly(item.answer).length > 0)) {
      results.push({
        type: 'FAQ',
        title: textOnly(f.question),
        excerpt: makeExcerpt(f.answer, q),
        url: '/perguntas-frequentes',
        date: null,
      })
    }

    // Contagem por tipo (preserva ordem de inserção/relevância dos grupos)
    const byType: Record<string, number> = {}
    for (const r of results) {
      byType[r.type] = (byType[r.type] || 0) + 1
    }

    return inertia.render('public/search/index', {
      q,
      results,
      total: results.length,
      byType,
      siteSettings,
    })
  }
}
