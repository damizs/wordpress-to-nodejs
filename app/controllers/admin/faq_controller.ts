import type { HttpContext } from '@adonisjs/core/http'
import FaqItem from '#models/faq_item'
import SystemCategory from '#models/system_category'
import { sanitizeRichHtml } from '#helpers/sanitize_html'
import TrashService from '#services/trash_service'

export default class FaqController {
  async index({ inertia }: HttpContext) {
    const items = await FaqItem.query()
      .whereNull('deleted_at')
      .orderBy('category')
      .orderBy('display_order')
    return inertia.render('admin/faq/index', {
      items: items.map((i) => i.serialize()),
    })
  }

  async create({ inertia }: HttpContext) {
    const categories = await SystemCategory.byType('faq')
    return inertia.render('admin/faq/form', {
      item: null,
      categories: categories.map((c) => c.serialize()),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['question', 'answer', 'category', 'display_order', 'is_active'])

    await FaqItem.create({
      question: data.question,
      answer: sanitizeRichHtml(data.answer),
      category: data.category,
      displayOrder: Number.parseInt(data.display_order) || 0,
      isActive: data.is_active === 'true' || data.is_active === true,
    })

    session.flash('success', 'Pergunta cadastrada com sucesso!')
    return response.redirect().toPath('/painel/faq')
  }

  async edit({ params, inertia }: HttpContext) {
    const item = await FaqItem.findOrFail(params.id)
    const categories = await SystemCategory.byType('faq')
    return inertia.render('admin/faq/form', {
      item: item.serialize(),
      categories: categories.map((c) => c.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const item = await FaqItem.findOrFail(params.id)
    const data = request.only(['question', 'answer', 'category', 'display_order', 'is_active'])

    item.merge({
      question: data.question,
      answer: sanitizeRichHtml(data.answer),
      category: data.category,
      displayOrder: Number.parseInt(data.display_order) || 0,
      isActive: data.is_active === 'true' || data.is_active === true,
    })
    await item.save()

    session.flash('success', 'Pergunta atualizada com sucesso!')
    return response.redirect().toPath('/painel/faq')
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session } = ctx
    const item = await FaqItem.findOrFail(params.id)
    await TrashService.moveToTrash(item, ctx, {
      displayName: item.question,
      resource: 'faq',
    })
    session.flash('success', 'Pergunta movida para a lixeira.')
    return response.redirect().toPath('/painel/faq')
  }
}
