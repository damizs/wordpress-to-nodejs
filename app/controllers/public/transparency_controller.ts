import type { HttpContext } from '@adonisjs/core/http'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'
import SiteSetting from '#models/site_setting'

export default class TransparencyController {
  /** Seções ativas com seus links, no formato consumido pela página */
  private async loadSections() {
    const sections = await TransparencySection.query()
      .where('is_active', true)
      .whereNull('deleted_at')
      .orderBy('display_order', 'asc')
    const sectionIds = sections.map((s) => s.id)
    const links = sectionIds.length
      ? await TransparencyLink.query()
          .whereIn('sectionId', sectionIds)
          .whereNull('deleted_at')
          .orderBy('display_order')
      : []

    return sections.map((section) => ({
      ...section.serialize(),
      links: links.filter((l) => l.sectionId === section.id).map((l) => l.serialize()),
    }))
  }

  async index({ inertia }: HttpContext) {
    const sectionsWithLinks = await this.loadSections()
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/transparency/index', {
      sections: sectionsWithLinks,
      siteSettings,
    })
  }

  /**
   * Deep-link do modal: /transparencia/:slug renderiza a mesma página da
   * transparência com o link correspondente já aberto no modal (prop openLink).
   */
  async show({ params, inertia, response }: HttpContext) {
    const link = await TransparencyLink.query()
      .where('slug', params.slug)
      .whereNull('deleted_at')
      .first()
    if (!link) {
      return response.redirect().toPath('/transparencia')
    }
    const section = await TransparencySection.query()
      .where('id', link.sectionId)
      .where('is_active', true)
      .whereNull('deleted_at')
      .first()
    if (!section) {
      return response.redirect().toPath('/transparencia')
    }

    const sectionsWithLinks = await this.loadSections()
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/transparency/index', {
      sections: sectionsWithLinks,
      siteSettings,
      openLink: link.serialize(),
    })
  }
}
