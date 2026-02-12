import type { HttpContext } from '@adonisjs/core/http'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'
import SiteSetting from '#models/site_setting'

export default class TransparencyController {
  async index({ inertia }: HttpContext) {
    const sections = await TransparencySection.query()
      .where('is_active', true)
      .orderBy('display_order', 'asc')
    const sectionIds = sections.map((s) => s.id)
    const links = sectionIds.length
      ? await TransparencyLink.query().whereIn('sectionId', sectionIds).orderBy('display_order')
      : []

    const sectionsWithLinks = sections.map((section) => ({
      ...section.serialize(),
      links: links.filter((l) => l.sectionId === section.id).map((l) => l.serialize()),
    }))

    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/transparency/index', { sections: sectionsWithLinks, siteSettings })
  }
}
