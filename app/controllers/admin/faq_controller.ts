import type { HttpContext } from '@adonisjs/core/http'
import FaqItem from '#models/faq_item'

export default class FaqController {
  async index({ inertia }: HttpContext) {
    const items = await FaqItem.query().orderBy('category').orderBy('display_order')
    return inertia.render('admin/faq/index', {
      items: items.map((i) => i.serialize()),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/faq/form', { item: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['question', 'answer', 'category', 'display_order', 'is_active'])

    await FaqItem.create({
      question: data.question,
      answer: data.answer,
      category: data.category,
      displayOrder: parseInt(data.display_order) || 0,
      isActive: data.is_active === 'true' || data.is_active === true,
    })

    session.flash('success', 'Pergunta cadastrada com sucesso!')
    return response.redirect().toPath('/painel/faq')
  }

  async edit({ params, inertia }: HttpContext) {
    const item = await FaqItem.findOrFail(params.id)
    return inertia.render('admin/faq/form', { item: item.serialize() })
  }

  async update({ params, request, response, session }: HttpContext) {
    const item = await FaqItem.findOrFail(params.id)
    const data = request.only(['question', 'answer', 'category', 'display_order', 'is_active'])

    item.merge({
      question: data.question,
      answer: data.answer,
      category: data.category,
      displayOrder: parseInt(data.display_order) || 0,
      isActive: data.is_active === 'true' || data.is_active === true,
    })
    await item.save()

    session.flash('success', 'Pergunta atualizada com sucesso!')
    return response.redirect().toPath('/painel/faq')
  }

  async destroy({ params, response, session }: HttpContext) {
    const item = await FaqItem.findOrFail(params.id)
    await item.delete()
    session.flash('success', 'Pergunta excluída com sucesso!')
    return response.redirect().toPath('/painel/faq')
  }
}
