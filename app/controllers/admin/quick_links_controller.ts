import type { HttpContext } from '@adonisjs/core/http'
import QuickLink from '#models/quick_link'

export default class QuickLinksController {
  async index({ inertia }: HttpContext) {
    const links = await QuickLink.query().orderBy('display_order', 'asc')
    return inertia.render('admin/quick-links/index', {
      links: links.map((l) => l.serialize()),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/quick-links/form', { link: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['title', 'url', 'icon', 'color', 'display_order', 'is_active'])
    data.is_active = data.is_active === 'true' || data.is_active === true
    data.display_order = parseInt(data.display_order) || 0

    await QuickLink.create({
      title: data.title,
      url: data.url,
      icon: data.icon,
      color: data.color,
      displayOrder: data.display_order,
      isActive: data.is_active,
    })
    session.flash('success', 'Link rápido cadastrado!')
    return response.redirect().toPath('/painel/links-rapidos')
  }

  async edit({ params, inertia }: HttpContext) {
    const link = await QuickLink.findOrFail(params.id)
    return inertia.render('admin/quick-links/form', { link: link.serialize() })
  }

  async update({ params, request, response, session }: HttpContext) {
    const link = await QuickLink.findOrFail(params.id)
    const data = request.only(['title', 'url', 'icon', 'color', 'display_order', 'is_active'])

    link.title = data.title
    link.url = data.url
    link.icon = data.icon
    link.color = data.color
    link.displayOrder = parseInt(data.display_order) || 0
    link.isActive = data.is_active === 'true' || data.is_active === true
    await link.save()

    session.flash('success', 'Link rápido atualizado!')
    return response.redirect().toPath('/painel/links-rapidos')
  }

  async destroy({ params, response, session }: HttpContext) {
    const link = await QuickLink.findOrFail(params.id)
    await link.delete()
    session.flash('success', 'Link rápido excluído!')
    return response.redirect().toPath('/painel/links-rapidos')
  }

  /** Reorder via AJAX */
  async reorder({ request, response }: HttpContext) {
    const { ids } = request.only(['ids'])
    if (Array.isArray(ids)) {
      for (let i = 0; i < ids.length; i++) {
        await QuickLink.query().where('id', ids[i]).update({ display_order: i + 1 })
      }
    }
    return response.json({ success: true })
  }
}
