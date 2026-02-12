import type { HttpContext } from '@adonisjs/core/http'
import OfficialPublication from '#models/official_publication'
import SiteSetting from '#models/site_setting'

export default class PublicationsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('tipo', '')
    const search = request.input('busca', '')

    let query = OfficialPublication.query().orderBy('publication_date', 'desc')
    if (type) query = query.where('type', type)
    if (search) query = query.whereILike('title', `%${search}%`)

    const publications = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/publications/index', {
      publications: publications.serialize(),
      filters: { type, search },
      siteSettings,
    })
  }
}
