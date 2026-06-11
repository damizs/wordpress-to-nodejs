import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import News from '#models/news'
import Councilor from '#models/councilor'
import QuickLink from '#models/quick_link'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'
import OfficialGazetteEntry from '#models/official_gazette_entry'
import OfficialPublication from '#models/official_publication'
import Legislature from '#models/legislature'
import InstagramImportLog from '#models/instagram_import_log'
import InstagramSetting from '#models/instagram_setting'
import SiteSetting from '#models/site_setting'
import Seal from '#models/seal'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    // Try to fetch seals, return empty array if table doesn't exist
    let seals: Seal[] = []
    try {
      seals = await Seal.query().where('is_active', true).orderBy('sort_order', 'asc')
    } catch (e) {
      console.log('Seals table may not exist yet:', e.message)
    }

    let instagramLogs: InstagramImportLog[] = []
    let instagramProfileUrl: string | null = null
    try {
      instagramLogs = await InstagramImportLog.query()
        .where('status', 'published')
        .whereNotNull('news_id')
        .preload('news')
        .orderBy('instagram_post_date', 'desc')
        .limit(8)
      instagramProfileUrl = await InstagramSetting.get('instagram_profile_url')
    } catch (e) {
      console.log('Instagram logs unavailable:', e.message)
    }

    const [
      news,
      councilors,
      quickLinks,
      transparencySections,
      latestGazette,
      publications,
      currentLegislature,
      siteSettings,
    ] = await Promise.all([
      News.query()
        .where('status', 'published')
        .orderBy('published_at', 'desc')
        .limit(5)
        .preload('category'),
      Councilor.query().where('is_active', true).orderBy('display_order', 'asc'),
      QuickLink.query().where('is_active', true).orderBy('display_order', 'asc'),
      TransparencySection.query().where('is_active', true).orderBy('display_order', 'asc'),
      OfficialGazetteEntry.query().orderBy('publication_date', 'desc').first(),
      OfficialPublication.query().orderBy('publication_date', 'desc').limit(6),
      Legislature.query().where('is_current', true).first(),
      SiteSetting.allAsObject(),
    ])

    // Fetch transparency links for each section
    const sectionIds = transparencySections.map((s) => s.id)
    const links = sectionIds.length
      ? await TransparencyLink.query().whereIn('sectionId', sectionIds).orderBy('display_order')
      : []

    const sectionsWithLinks = transparencySections.map((section) => ({
      ...section.serialize(),
      links: links.filter((l) => l.sectionId === section.id).map((l) => l.serialize()),
    }))

    // Map news to expected format for NewsSection component
    const mappedNews = news.map((n, index) => ({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt || '',
      date: n.publishedAt?.toFormat('dd/MM/yyyy') || '',
      image: n.coverImageUrl,
      slug: n.slug,
      featured: index === 0, // First news is featured
    }))

    // Datas vindas do Postgres podem chegar como Date (coluna date) ou string ISO
    const formatDate = (value: unknown) => {
      if (!value) return ''
      const dt =
        value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(String(value))
      return dt.isValid ? dt.toFormat('dd/MM/yyyy') : ''
    }

    // Homepage mostra só os vereadores da legislatura atual (evita mesas duplicadas)
    const currentCouncilors = currentLegislature
      ? councilors.filter((c) => c.legislatureId === currentLegislature.id)
      : []
    const councilorsToShow = currentCouncilors.length > 0 ? currentCouncilors : councilors

    const vereadores = councilorsToShow.map((c) => ({
      id: c.id,
      nome: c.name,
      apelido: c.parliamentaryName || c.party || '',
      cargo: c.role || 'Vereador(a)',
      foto: c.photoUrl,
      slug: c.slug,
      ativo: c.isActive,
    }))

    const publicacoes = publications.map((p) => ({
      id: p.id,
      titulo: p.title,
      data: formatDate(p.publicationDate),
      tipo: p.type,
      arquivo: p.fileUrl,
    }))

    const instagramPosts = instagramLogs.map((log) => ({
      id: log.id,
      title: log.news?.title || log.generatedTitle || '',
      excerpt: log.news?.excerpt || '',
      image: log.news?.coverImageUrl || log.instagramImageUrl,
      slug: log.news?.slug || null,
      instagramUrl: log.instagramUrl,
      date: log.instagramPostDate?.toFormat('dd/MM/yyyy') || '',
    }))

    // Extrai o ano de Date ou string ISO (String(Date) daria "Wed Jan ...")
    const yearOf = (value: unknown) => {
      if (value instanceof Date) return String(value.getFullYear())
      const match = String(value ?? '').match(/\d{4}/)
      return match ? match[0] : ''
    }
    const startYear = yearOf(currentLegislature?.startDate)
    const endYear = yearOf(currentLegislature?.endDate)
    const legislatura = startYear && endYear ? `${startYear}-${endYear}` : undefined

    return inertia.render('home', {
      news: mappedNews,
      vereadores,
      publicacoes,
      instagramPosts,
      instagramProfileUrl,
      legislatura,
      quickLinks: quickLinks.map((q) => q.serialize()),
      transparencySections: sectionsWithLinks,
      latestGazette: latestGazette
        ? {
            id: latestGazette.id,
            editionNumber: latestGazette.editionNumber,
            publicationDate: latestGazette.publicationDate,
            description: latestGazette.description,
            fileUrl: latestGazette.fileUrl,
          }
        : null,
      siteSettings,
      newsBackgroundImage: siteSettings.news_background_image || null,
      seals: seals.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        imageUrl: s.imageUrl,
        linkUrl: s.linkUrl,
      })),
    })
  }
}
