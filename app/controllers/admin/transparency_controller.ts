import type { HttpContext } from '@adonisjs/core/http'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'

export default class TransparencyController {
  async index({ inertia }: HttpContext) {
    const sections = await TransparencySection.query().orderBy('display_order', 'asc')
    const sectionIds = sections.map((s) => s.id)
    const links = sectionIds.length
      ? await TransparencyLink.query().whereIn('section_id', sectionIds).orderBy('display_order')
      : []

    const sectionsWithLinks = sections.map((section) => ({
      ...section.serialize(),
      links: links.filter((l) => l.sectionId === section.id).map((l) => l.serialize()),
    }))

    return inertia.render('admin/transparency/index', { sections: sectionsWithLinks })
  }

  // --- Sections ---
  async createSection({ inertia }: HttpContext) {
    return inertia.render('admin/transparency/section-form', { section: null })
  }

  async storeSection({ request, response, session }: HttpContext) {
    const data = request.only(['title', 'slug', 'icon', 'description', 'display_order', 'is_active'])
    if (!data.slug) {
      data.slug = data.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    data.is_active = data.is_active === 'true' || data.is_active === true
    data.display_order = parseInt(data.display_order) || 0

    await TransparencySection.create({
      title: data.title, slug: data.slug, icon: data.icon,
      description: data.description, displayOrder: data.display_order, isActive: data.is_active,
    })
    session.flash('success', 'Seção criada!')
    return response.redirect().toPath('/painel/transparencia')
  }

  async editSection({ params, inertia }: HttpContext) {
    const section = await TransparencySection.findOrFail(params.id)
    return inertia.render('admin/transparency/section-form', { section: section.serialize() })
  }

  async updateSection({ params, request, response, session }: HttpContext) {
    const section = await TransparencySection.findOrFail(params.id)
    const data = request.only(['title', 'slug', 'icon', 'description', 'display_order', 'is_active'])
    section.title = data.title
    section.slug = data.slug || section.slug
    section.icon = data.icon
    section.description = data.description
    section.displayOrder = parseInt(data.display_order) || 0
    section.isActive = data.is_active === 'true' || data.is_active === true
    await section.save()
    session.flash('success', 'Seção atualizada!')
    return response.redirect().toPath('/painel/transparencia')
  }

  async destroySection({ params, response, session }: HttpContext) {
    const section = await TransparencySection.findOrFail(params.id)
    await TransparencyLink.query().where('section_id', section.id).delete()
    await section.delete()
    session.flash('success', 'Seção excluída!')
    return response.redirect().toPath('/painel/transparencia')
  }

  // --- Links ---
  async createLink({ params, inertia }: HttpContext) {
    const section = await TransparencySection.findOrFail(params.sectionId)
    return inertia.render('admin/transparency/link-form', { section: section.serialize(), link: null })
  }

  async storeLink({ params, request, response, session }: HttpContext) {
    const data = request.only(['title', 'url', 'icon', 'display_order', 'is_external'])
    await TransparencyLink.create({
      sectionId: parseInt(params.sectionId),
      title: data.title, url: data.url, icon: data.icon,
      displayOrder: parseInt(data.display_order) || 0,
      isExternal: data.is_external === 'true' || data.is_external === true,
    })
    session.flash('success', 'Link adicionado!')
    return response.redirect().toPath('/painel/transparencia')
  }

  async editLink({ params, inertia }: HttpContext) {
    const link = await TransparencyLink.findOrFail(params.id)
    const section = await TransparencySection.findOrFail(link.sectionId)
    return inertia.render('admin/transparency/link-form', { section: section.serialize(), link: link.serialize() })
  }

  async updateLink({ params, request, response, session }: HttpContext) {
    const link = await TransparencyLink.findOrFail(params.id)
    const data = request.only(['title', 'url', 'icon', 'display_order', 'is_external'])
    link.title = data.title
    link.url = data.url
    link.icon = data.icon
    link.displayOrder = parseInt(data.display_order) || 0
    link.isExternal = data.is_external === 'true' || data.is_external === true
    await link.save()
    session.flash('success', 'Link atualizado!')
    return response.redirect().toPath('/painel/transparencia')
  }

  async destroyLink({ params, response, session }: HttpContext) {
    const link = await TransparencyLink.findOrFail(params.id)
    await link.delete()
    session.flash('success', 'Link excluído!')
    return response.redirect().toPath('/painel/transparencia')
  }
}
