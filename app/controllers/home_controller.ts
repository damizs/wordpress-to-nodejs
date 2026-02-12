import type { HttpContext } from '@adonisjs/core/http'
import News from '#models/news'
import Councilor from '#models/councilor'
import QuickLink from '#models/quick_link'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'
import OfficialGazetteEntry from '#models/official_gazette_entry'
import SiteSetting from '#models/site_setting'

export default class HomeController {
  async index({ inertia }: HttpContext) {
    const [news, councilors, quickLinks, transparencySections, latestGazette, siteSettings] = await Promise.all([
      News.query()
        .where('status', 'published')
        .orderBy('published_at', 'desc')
        .limit(5)
        .preload('category'),
      Councilor.query()
        .where('is_active', true)
        .orderBy('display_order', 'asc'),
      QuickLink.query()
        .where('is_active', true)
        .orderBy('display_order', 'asc'),
      TransparencySection.query()
        .where('is_active', true)
        .orderBy('display_order', 'asc'),
      OfficialGazetteEntry.query()
        .orderBy('publication_date', 'desc')
        .first(),
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

    return inertia.render('home', {
      news: news.map((n) => n.serialize()),
      councilors: councilors.map((c) => c.serialize()),
      quickLinks: quickLinks.map((q) => q.serialize()),
      transparencySections: sectionsWithLinks,
      latestGazette: latestGazette?.serialize() ?? null,
      siteSettings,
    })
  }
}
