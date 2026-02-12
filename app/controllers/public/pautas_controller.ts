import type { HttpContext } from '@adonisjs/core/http'
import PlenarySession from '#models/plenary_session'
import SiteSetting from '#models/site_setting'

export default class PautasController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')

    let query = PlenarySession.query()
      .whereNotNull('agenda')
      .where('agenda', '!=', '')
      .orderBy('session_date', 'desc')
    if (year) query = query.where('year', year)

    const sessions = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/pautas/index', { sessions: sessions.serialize(), filters: { year }, siteSettings })
  }

  async show({ params, inertia }: HttpContext) {
    const session = await PlenarySession.query().where('slug', params.slug).firstOrFail()
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/pautas/show', { session: session.serialize(), siteSettings })
  }
}
