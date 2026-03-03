import type { HttpContext } from '@adonisjs/core/http'
import SystemCategory from '#models/system_category'

export default class SystemCategoriesController {
  async index({ inertia, request }: HttpContext) {
    const typeFilter = request.input('type', '')
    let query = SystemCategory.query().orderBy('type').orderBy('display_order')
    if (typeFilter) query = query.where('type', typeFilter)
    const categories = await query
    return inertia.render('admin/categories/index', {
      categories: categories.map((c) => c.serialize()),
      filters: { type: typeFilter },
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/categories/form', { category: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['type', 'name', 'slug', 'display_order', 'is_active'])
    if (!data.slug) {
      data.slug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    await SystemCategory.create({
      type: data.type,
      name: data.name,
      slug: data.slug,
      displayOrder: parseInt(data.display_order) || 0,
      isActive: data.is_active === 'true' || data.is_active === true || data.is_active === 'on',
    })
    session.flash('success', 'Categoria cadastrada com sucesso!')
    return response.redirect().toPath('/painel/categorias')
  }

  async edit({ params, inertia }: HttpContext) {
    const category = await SystemCategory.findOrFail(params.id)
    return inertia.render('admin/categories/form', { category: category.serialize() })
  }

  async update({ params, request, response, session }: HttpContext) {
    const category = await SystemCategory.findOrFail(params.id)
    const data = request.only(['type', 'name', 'slug', 'display_order', 'is_active'])
    category.merge({
      type: data.type,
      name: data.name,
      slug: data.slug || category.slug,
      displayOrder: parseInt(data.display_order) || 0,
      isActive: data.is_active === 'true' || data.is_active === true || data.is_active === 'on',
    })
    await category.save()
    session.flash('success', 'Categoria atualizada!')
    return response.redirect().toPath('/painel/categorias')
  }

  async destroy({ params, response, session }: HttpContext) {
    const category = await SystemCategory.findOrFail(params.id)
    await category.delete()
    session.flash('success', 'Categoria excluída!')
    return response.redirect().toPath('/painel/categorias')
  }

  /** API endpoint for loading categories by type (used by other forms) */
  async byType({ params, response }: HttpContext) {
    const categories = await SystemCategory.query()
      .where('type', params.type)
      .where('is_active', true)
      .orderBy('display_order')
    return response.json(categories.map((c) => c.serialize()))
  }
}
