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

    return inertia.render('public/atas/index', {
      atas: sessions.all().map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        date: s.sessionDate,
        file_url: s.fileUrl,
      })),
      pagination: {
        currentPage: sessions.currentPage,
        lastPage: sessions.lastPage,
      },
      filters: { year, type },
      siteSettings,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const session = await PlenarySession.query().where('slug', params.slug).first()
    // Slug antigo do WP sem correspondente: preserva o link com 301 para a listagem
    if (!session) return response.redirect().status(301).toPath('/atas')
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/atas/show', {
      ata: {
        id: session.id,
        title: session.title,
        slug: session.slug,
        date: session.sessionDate,
        content: session.minutes,
        file_url: session.fileUrl,
      },
      siteSettings,
    })
  }
}
