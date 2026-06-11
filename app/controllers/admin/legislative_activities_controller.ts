import type { HttpContext } from '@adonisjs/core/http'
import LegislativeActivity from '#models/legislative_activity'
import Councilor from '#models/councilor'
import { activitySlug } from '#helpers/slug'

export default class LegislativeActivitiesController {
  private async councilorOptions() {
    const councilors = await Councilor.query()
      .where('is_active', true)
      .orderBy('display_order', 'asc')
    return councilors.map((c) => ({
      id: c.id,
      name: c.parliamentaryName || c.name,
      party: c.party,
      photo: c.photoUrl,
    }))
  }

  /** Resolve o texto do campo author a partir dos vereadores selecionados + texto livre */
  private async resolveAuthor(authorIds: number[], freeText: string | null) {
    if (authorIds.length === 0) return freeText
    const selected = await Councilor.query().whereIn('id', authorIds)
    const names = selected.map((c) => c.parliamentaryName || c.name)
    if (freeText && freeText.trim() !== '') names.push(freeText.trim())
    return names.join(', ')
  }

  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('type', '')
    const year = request.input('year', '')
    const search = request.input('search', '')

    let query = LegislativeActivity.query().orderBy('year', 'desc').orderBy('created_at', 'desc')
    if (type) query = query.where('type', type)
    if (year) query = query.where('year', Number.parseInt(year))
    if (search)
      query = query.where((q) => {
        q.whereILike('summary', `%${search}%`)
          .orWhereILike('number', `%${search}%`)
          .orWhereILike('title', `%${search}%`)
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
    return inertia.render('admin/activities/form', {
      activity: null,
      councilors: await this.councilorOptions(),
      authorIds: [],
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title',
      'type',
      'number',
      'year',
      'summary',
      'content',
      'status',
      'author',
      'file_url',
      'session_date',
    ])
    data.year = Number.parseInt(data.year)

    const authorIds = (request.input('author_ids', []) as (number | string)[])
      .map(Number)
      .filter((n) => Number.isFinite(n))
    data.author = await this.resolveAuthor(authorIds, data.author)

    const slug = request.input('slug') || activitySlug(data.type, data.number, data.author)

    const activity = await LegislativeActivity.create({ ...data, slug, isActive: true })
    if (authorIds.length > 0) await activity.related('authors').sync(authorIds)

    session.flash('success', 'Atividade legislativa cadastrada!')
    return response.redirect().toPath('/painel/atividades')
  }

  async edit({ params, inertia }: HttpContext) {
    const activity = await LegislativeActivity.query()
      .where('id', params.id)
      .preload('authors')
      .firstOrFail()
    return inertia.render('admin/activities/form', {
      activity: activity.serialize(),
      councilors: await this.councilorOptions(),
      authorIds: activity.authors.map((a) => a.id),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const activity = await LegislativeActivity.findOrFail(params.id)
    const data = request.only([
      'title',
      'type',
      'number',
      'year',
      'summary',
      'content',
      'status',
      'author',
      'file_url',
      'session_date',
    ])
    data.year = Number.parseInt(data.year)

    const authorIds = (request.input('author_ids', []) as (number | string)[])
      .map(Number)
      .filter((n) => Number.isFinite(n))
    data.author = await this.resolveAuthor(authorIds, data.author)

    const slug =
      activity.slug || request.input('slug') || activitySlug(data.type, data.number, data.author)

    activity.merge({ ...data, slug })
    await activity.save()
    await activity.related('authors').sync(authorIds)

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
