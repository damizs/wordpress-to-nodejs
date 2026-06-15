import type { HttpContext } from '@adonisjs/core/http'
import PlenarySession from '#models/plenary_session'
import SiteSetting from '#models/site_setting'

export default class PautasController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const type = request.input('tipo', '')
    const search = request.input('busca', '')

    let query = PlenarySession.query()
      .whereNotNull('agenda')
      .where('agenda', '!=', '')
      .orderBy('session_date', 'desc')
    if (year) query = query.where('year', year)
    if (type) query = query.where('type', type)
    if (search) query = query.whereILike('title', `%${search}%`)

    const sessions = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()

    const yearRows = await PlenarySession.query()
      .whereNotNull('agenda')
      .where('agenda', '!=', '')
      .distinct('year')
      .orderBy('year', 'desc')

    const typeRows = await PlenarySession.query()
      .whereNotNull('agenda')
      .where('agenda', '!=', '')
      .whereNotNull('type')
      .distinct('type')
      .orderBy('type', 'asc')

    return inertia.render('public/pautas/index', {
      pautas: sessions.all().map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        date: s.sessionDate,
        session_type: s.type,
      })),
      pagination: {
        currentPage: sessions.currentPage,
        lastPage: sessions.lastPage,
        total: sessions.total,
      },
      years: yearRows.map((r) => r.year).filter(Boolean),
      types: typeRows.map((r) => r.type).filter(Boolean),
      filters: { year, type, search },
      siteSettings,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const session = await PlenarySession.query().where('slug', params.slug).first()
    if (!session) return response.redirect().status(301).toPath('/pautas')
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/pautas/show', {
      pauta: {
        id: session.id,
        title: session.title,
        slug: session.slug,
        date: session.sessionDate,
        time: session.startTime,
        content: session.agenda,
      },
      siteSettings,
    })
  }
}
