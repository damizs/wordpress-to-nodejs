import type { HttpContext } from '@adonisjs/core/http'
import LegislativeActivity from '#models/legislative_activity'
import { activitySlug } from '#helpers/slug'

export default class LegislativeActivitiesController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('type', '')
    const year = request.input('year', '')
    const search = request.input('search', '')

    let query = LegislativeActivity.query().orderBy('year', 'desc').orderBy('created_at', 'desc')
    if (type) query = query.where('type', type)
    if (year) query = query.where('year', parseInt(year))
    if (search) query = query.where((q) => {
      q.whereILike('summary', `%${search}%`).orWhereILike('number', `%${search}%`).orWhereILike('title', `%${search}%`)
    })

    const activities = await query.paginate(page, 20)
    const types = await LegislativeActivity.query().distinct('type').orderBy('type')
    const years = await LegislativeActivity.query().distinct('year').orderBy('year', 'desc')

    return inertia.render('admin/activities/index', {
      activities: activities.serialize(),
      filters: { type, year, search },
      types: types.map((t) => t.type),
      years: years.map((y) => y.year),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/activities/form', { activity: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title', 'type', 'number', 'year', 'summary', 'content', 'status', 'author', 'file_url', 'session_date',
    ])
    data.year = parseInt(data.year)
    const slug = request.input('slug') || activitySlug(data.type, data.number, data.author)

    await LegislativeActivity.create({ ...data, slug, isActive: true })
    session.flash('success', 'Atividade legislativa cadastrada!')
    return response.redirect().toPath('/painel/atividades')
  }

  async edit({ params, inertia }: HttpContext) {
    const activity = await LegislativeActivity.findOrFail(params.id)
    return inertia.render('admin/activities/form', { activity: activity.serialize() })
  }

  async update({ params, request, response, session }: HttpContext) {
    const activity = await LegislativeActivity.findOrFail(params.id)
    const data = request.only([
      'title', 'type', 'number', 'year', 'summary', 'content', 'status', 'author', 'file_url', 'session_date',
    ])
    data.year = parseInt(data.year)
    const slug = activity.slug || request.input('slug') || activitySlug(data.type, data.number, data.author)

    activity.merge({ ...data, slug })
    await activity.save()
    session.flash('success', 'Atividade legislativa atualizada!')
    return response.redirect().toPath('/painel/atividades')
  }

  async destroy({ params, response, session }: HttpContext) {
    const activity = await LegislativeActivity.findOrFail(params.id)
    await activity.delete()
    session.flash('success', 'Atividade legislativa excluída!')
    return response.redirect().toPath('/painel/atividades')
  }
}
