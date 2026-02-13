import type { HttpContext } from '@adonisjs/core/http'
import News from '#models/news'
import Councilor from '#models/councilor'
import PlenarySession from '#models/plenary_session'
import OfficialPublication from '#models/official_publication'
import LegislativeActivity from '#models/legislative_activity'
import Licitacao from '#models/licitacao'

const BASE_URL = 'https://node.camaradesume.pb.gov.br'

export default class SeoController {
  async sitemap({ response }: HttpContext) {
    const [news, councilors, sessions, publications, activities, licitacoes] = await Promise.all([
      News.query().where('status', 'published').orderBy('published_at', 'desc').select('slug', 'updated_at', 'published_at'),
      Councilor.query().where('is_active', true).select('slug', 'updated_at'),
      PlenarySession.query().whereNotNull('slug').select('slug', 'updated_at'),
      OfficialPublication.query().whereNotNull('slug').select('slug', 'updated_at'),
      LegislativeActivity.query().whereNotNull('slug').select('slug', 'updated_at'),
      Licitacao.query().select('slug', 'updated_at'),
    ])

    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/noticias', priority: '0.9', changefreq: 'daily' },
      { url: '/vereadores', priority: '0.8', changefreq: 'monthly' },
      { url: '/transparencia', priority: '0.9', changefreq: 'weekly' },
      { url: '/mesa-diretora', priority: '0.7', changefreq: 'yearly' },
      { url: '/comissoes', priority: '0.7', changefreq: 'yearly' },
      { url: '/atas', priority: '0.8', changefreq: 'weekly' },
      { url: '/pautas', priority: '0.7', changefreq: 'weekly' },
      { url: '/atividades-legislativa', priority: '0.8', changefreq: 'weekly' },
      { url: '/publicacoes-oficiais', priority: '0.8', changefreq: 'weekly' },
      { url: '/licitacoes', priority: '0.8', changefreq: 'weekly' },
      { url: '/perguntas-frequentes', priority: '0.5', changefreq: 'monthly' },
      { url: '/pesquisa-de-satisfacao', priority: '0.4', changefreq: 'monthly' },
      { url: '/politica-de-privacidade', priority: '0.3', changefreq: 'yearly' },
    ]

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`
    xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n`
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`
      xml += `    <loc>${BASE_URL}${page.url}</loc>\n`
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`
      xml += `    <priority>${page.priority}</priority>\n`
      xml += `  </url>\n`
    }

    // News articles
    for (const item of news) {
      xml += `  <url>\n`
      xml += `    <loc>${BASE_URL}/noticias/${item.slug}</loc>\n`
      xml += `    <lastmod>${(item.updatedAt || item.publishedAt)?.toISO()}</lastmod>\n`
      xml += `    <changefreq>monthly</changefreq>\n`
      xml += `    <priority>0.7</priority>\n`
      xml += `  </url>\n`
    }

    // Councilors
    for (const item of councilors) {
      xml += `  <url>\n`
      xml += `    <loc>${BASE_URL}/vereadores/${item.slug}</loc>\n`
      xml += `    <lastmod>${item.updatedAt?.toISO()}</lastmod>\n`
      xml += `    <changefreq>monthly</changefreq>\n`
      xml += `    <priority>0.6</priority>\n`
      xml += `  </url>\n`
    }

    // Sessions
    for (const item of sessions) {
      xml += `  <url>\n`
      xml += `    <loc>${BASE_URL}/atas/${item.slug}</loc>\n`
      xml += `    <lastmod>${item.updatedAt?.toISO()}</lastmod>\n`
      xml += `    <changefreq>monthly</changefreq>\n`
      xml += `    <priority>0.6</priority>\n`
      xml += `  </url>\n`
    }

    // Publications
    for (const item of publications) {
      xml += `  <url>\n`
      xml += `    <loc>${BASE_URL}/publicacoes-oficiais/${item.slug}</loc>\n`
      xml += `    <lastmod>${item.updatedAt?.toISO()}</lastmod>\n`
      xml += `    <changefreq>monthly</changefreq>\n`
      xml += `    <priority>0.6</priority>\n`
      xml += `  </url>\n`
    }

    // Activities
    for (const item of activities) {
      xml += `  <url>\n`
      xml += `    <loc>${BASE_URL}/atividades-legislativa/${item.slug}</loc>\n`
      xml += `    <lastmod>${item.updatedAt?.toISO()}</lastmod>\n`
      xml += `    <changefreq>monthly</changefreq>\n`
      xml += `    <priority>0.6</priority>\n`
      xml += `  </url>\n`
    }

    // Licitacoes
    for (const item of licitacoes) {
      xml += `  <url>\n`
      xml += `    <loc>${BASE_URL}/licitacoes/${item.slug}</loc>\n`
      xml += `    <lastmod>${item.updatedAt?.toISO()}</lastmod>\n`
      xml += `    <changefreq>monthly</changefreq>\n`
      xml += `    <priority>0.6</priority>\n`
      xml += `  </url>\n`
    }

    xml += `</urlset>`

    response.header('Content-Type', 'application/xml')
    response.header('Cache-Control', 'public, max-age=3600')
    return response.send(xml)
  }

  async robots({ response }: HttpContext) {
    const txt = `User-agent: *
Allow: /
Disallow: /painel/
Disallow: /login
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`
    response.header('Content-Type', 'text/plain')
    return response.send(txt)
  }
}
