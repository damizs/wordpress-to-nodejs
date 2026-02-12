import type { HttpContext } from '@adonisjs/core/http'
import Biennium from '#models/biennium'
import Legislature from '#models/legislature'

export default class BienniaController {
  async index({ inertia }: HttpContext) {
    const biennia = await Biennium.query()
      .preload('legislature')
      .withCount('positions')
      .orderBy('start_date', 'desc')
    return inertia.render('admin/biennia/index', {
      biennia: biennia.map((b) => ({
        ...b.serialize(),
        legislature_name: b.legislature?.name || '',
        positions_count: b.$extras.positions_count,
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    const legislatures = await Legislature.query().orderBy('number', 'desc')
    return inertia.render('admin/biennia/form', {
      biennium: null,
      legislatures: legislatures.map((l) => l.serialize()),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['name', 'legislature_id', 'start_date', 'end_date', 'is_current'])
    const isCurrent = data.is_current === 'true' || data.is_current === true
    if (isCurrent) {
      await Biennium.query().update({ isCurrent: false })
    }
    await Biennium.create({
      name: data.name,
      legislatureId: parseInt(data.legislature_id),
      startDate: data.start_date,
      endDate: data.end_date,
      isCurrent: isCurrent,
    })
    session.flash('success', 'Biênio cadastrado com sucesso!')
    return response.redirect().toPath('/painel/bienios')
  }

  async edit({ params, inertia }: HttpContext) {
    const biennium = await Biennium.findOrFail(params.id)
    const legislatures = await Legislature.query().orderBy('number', 'desc')
    return inertia.render('admin/biennia/form', {
      biennium: biennium.serialize(),
      legislatures: legislatures.map((l) => l.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const biennium = await Biennium.findOrFail(params.id)
    const data = request.only(['name', 'legislature_id', 'start_date', 'end_date', 'is_current'])
    const isCurrent = data.is_current === 'true' || data.is_current === true
    if (isCurrent && !biennium.isCurrent) {
      await Biennium.query().update({ isCurrent: false })
    }
    biennium.merge({
      name: data.name,
      legislatureId: parseInt(data.legislature_id),
      startDate: data.start_date,
      endDate: data.end_date,
      isCurrent: isCurrent,
    })
    await biennium.save()
    session.flash('success', 'Biênio atualizado!')
    return response.redirect().toPath('/painel/bienios')
  }

  async destroy({ params, response, session }: HttpContext) {
    const biennium = await Biennium.findOrFail(params.id)
    await biennium.delete()
    session.flash('success', 'Biênio excluído!')
    return response.redirect().toPath('/painel/bienios')
  }
}
