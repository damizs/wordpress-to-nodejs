import type { HttpContext } from '@adonisjs/core/http'
import PlenarySession from '#models/plenary_session'
import SiteSetting from '#models/site_setting'

export default class AtasController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const type = request.input('tipo', '')

    let query = PlenarySession.query()
      .whereNotNull('file_url')
      .where('status', 'realizada')
      .orderBy('session_date', 'desc')
    if (year) query = query.where('year', year)
    if (type) query = query.where('type', type)

    const sessions = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/atas/index', { sessions: sessions.serialize(), filters: { year, type }, siteSettings })
  }

  async show({ params, inertia }: HttpContext) {
    const session = await PlenarySession.query().where('slug', params.slug).firstOrFail()
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/atas/show', { session: session.serialize(), siteSettings })
  }
}
