import type { HttpContext } from '@adonisjs/core/http'
import LegislativeActivity from '#models/legislative_activity'
import SiteSetting from '#models/site_setting'

export default class ActivitiesController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('tipo', '')
    const year = request.input('ano', '')
    const autor = request.input('autor', '')
    const status = request.input('situacao', '')
    const search = request.input('busca', '')

    let query = LegislativeActivity.query()
      .preload('authors')
      .orderBy('year', 'desc')
      .orderBy('created_at', 'desc')
    if (type) query = query.where('type', type)
    if (year) query = query.where('year', year)
    if (status) query = query.where('status', status)
    if (search) {
      query = query.where((q) => {
        q.whereILike('title', `%${search}%`)
          .orWhereILike('summary', `%${search}%`)
          .orWhereILike('number', `%${search}%`)
      })
    }
    if (autor) {
      query = query.where((q) => {
        q.whereILike('author', `%${autor}%`).orWhereHas('authors', (sub) => {
          sub.whereILike('name', `%${autor}%`).orWhereILike('parliamentary_name', `%${autor}%`)
        })
      })
    }

    const activities = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()

    // Opções dos filtros (tipos e anos existentes na base)
    const typeRows = await LegislativeActivity.query().distinct('type').orderBy('type', 'asc')
    const yearRows = await LegislativeActivity.query().distinct('year').orderBy('year', 'desc')
    const statusRows = await LegislativeActivity.query()
      .whereNotNull('status')
      .where('status', '!=', '')
      .distinct('status')
      .orderBy('status', 'asc')

    return inertia.render('public/activities/index', {
      activities: activities.all().map((a) => ({
        id: a.id,
        title: a.title || `${a.type} nº ${a.number}/${a.year}`,
        slug: a.slug,
        summary: a.summary || null,
        date: a.sessionDate || a.createdAt?.toISODate() || null,
        type: a.type,
        author: a.author ? { name: a.author } : null,
        authors: a.authors.map((c) => ({
          id: c.id,
          name: c.parliamentaryName || c.name,
          slug: c.slug,
        })),
        file_url: a.fileUrl || null,
        export_url: `/atividades-legislativas/${a.slug}/exportar`,
      })),
      pagination: {
        currentPage: activities.currentPage,
        lastPage: activities.lastPage,
        total: activities.total,
      },
      filters: { type, year, autor, status, search },
      types: typeRows.map((r) => r.type).filter(Boolean),
      years: yearRows.map((r) => r.year).filter(Boolean),
      statuses: statusRows.map((r) => r.status).filter(Boolean),
      siteSettings,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const activity = await LegislativeActivity.query()
      .where('slug', params.slug)
      .preload('authors')
      .first()
    if (!activity) return response.redirect().status(301).toPath('/atividades-legislativas')
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/activities/show', {
      activity: activity.serialize(),
      exportUrl: `/atividades-legislativas/${activity.slug}/exportar`,
      authors: activity.authors.map((a) => ({
        id: a.id,
        name: a.parliamentaryName || a.name,
        slug: a.slug,
        photo: a.photoUrl,
        party: a.party,
      })),
      siteSettings,
    })
  }

  /** Exportação PNTP/ATRICON: redireciona ao PDF nativo ou renderiza página para impressão/salvar como PDF. */
  async export({ params, inertia, response }: HttpContext) {
    const activity = await LegislativeActivity.query()
      .where('slug', params.slug)
      .preload('authors')
      .first()
    if (!activity) return response.redirect().status(301).toPath('/atividades-legislativas')
    if (activity.fileUrl) return response.redirect(activity.fileUrl)

    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/activities/export', {
      activity: {
        title: activity.title || `${activity.type} nº ${activity.number}/${activity.year}`,
        slug: activity.slug,
        type: activity.type,
        number: activity.number,
        year: activity.year,
        summary: activity.summary,
        content: activity.content,
        status: activity.status,
        sessionDate: activity.sessionDate,
        author: activity.author,
      },
      authors: activity.authors.map((a) => ({
        name: a.parliamentaryName || a.name,
      })),
      siteSettings,
    })
  }
}
