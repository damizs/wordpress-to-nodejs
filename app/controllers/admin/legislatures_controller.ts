import type { HttpContext } from '@adonisjs/core/http'
import Legislature from '#models/legislature'

export default class LegislaturesController {
  async index({ inertia }: HttpContext) {
    const legislatures = await Legislature.query()
      .withCount('councilors')
      .withCount('biennia')
      .orderBy('number', 'desc')
    return inertia.render('admin/legislatures/index', {
      legislatures: legislatures.map((l) => ({
        ...l.serialize(),
        councilors_count: l.$extras.councilors_count,
        biennia_count: l.$extras.biennia_count,
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/legislatures/form', { legislature: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['name', 'number', 'start_date', 'end_date', 'is_current'])
    data.is_current = data.is_current === 'true' || data.is_current === true

    if (data.is_current) {
      await Legislature.query().update({ isCurrent: false })
    }

    await Legislature.create({
      name: data.name,
      number: parseInt(data.number),
      startDate: data.start_date,
      endDate: data.end_date,
      isCurrent: data.is_current,
    })

    session.flash('success', 'Legislatura cadastrada com sucesso!')
    return response.redirect().toPath('/painel/legislaturas')
  }

  async edit({ params, inertia }: HttpContext) {
    const legislature = await Legislature.findOrFail(params.id)
    return inertia.render('admin/legislatures/form', { legislature: legislature.serialize() })
  }

  async update({ params, request, response, session }: HttpContext) {
    const legislature = await Legislature.findOrFail(params.id)
    const data = request.only(['name', 'number', 'start_date', 'end_date', 'is_current'])
    const isCurrent = data.is_current === 'true' || data.is_current === true

    if (isCurrent && !legislature.isCurrent) {
      await Legislature.query().update({ isCurrent: false })
    }

    legislature.merge({
      name: data.name,
      number: parseInt(data.number),
      startDate: data.start_date,
      endDate: data.end_date,
      isCurrent: isCurrent,
    })
    await legislature.save()

    session.flash('success', 'Legislatura atualizada com sucesso!')
    return response.redirect().toPath('/painel/legislaturas')
  }

  async destroy({ params, response, session }: HttpContext) {
    const legislature = await Legislature.findOrFail(params.id)
    await legislature.delete()
    session.flash('success', 'Legislatura excluída com sucesso!')
    return response.redirect().toPath('/painel/legislaturas')
  }
}
