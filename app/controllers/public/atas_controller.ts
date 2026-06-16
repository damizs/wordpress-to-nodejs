import type { HttpContext } from '@adonisjs/core/http'
import Ata from '#models/ata'
import SiteSetting from '#models/site_setting'

export default class AtasController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const type = request.input('tipo', '')
    const search = request.input('busca', '')

    let query = Ata.query().where('is_published', true).orderBy('document_date', 'desc')
    if (year) query = query.where('year', year)
    if (type) query = query.where('type', type)
    if (search) query = query.whereILike('title', `%${search}%`)

    const atas = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()

    const yearRows = await Ata.query()
      .where('is_published', true)
      .distinct('year')
      .orderBy('year', 'desc')

    const typeRows = await Ata.query()
      .where('is_published', true)
      .whereNotNull('type')
      .distinct('type')
      .orderBy('type', 'asc')

    return inertia.render('public/atas/index', {
      atas: atas.all().map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        date: s.documentDate,
        file_url: s.fileUrl,
      })),
      pagination: {
        currentPage: atas.currentPage,
        lastPage: atas.lastPage,
        total: atas.total,
      },
      years: yearRows.map((r) => r.year).filter(Boolean),
      types: typeRows.map((r) => r.type).filter(Boolean),
      filters: { year, type, search },
      siteSettings,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const ata = await Ata.query().where('slug', params.slug).first()
    // Slug antigo do WP sem correspondente: preserva o link com 301 para a listagem
    if (!ata) return response.redirect().status(301).toPath('/atas')
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/atas/show', {
      ata: {
        id: ata.id,
        title: ata.title,
        slug: ata.slug,
        date: ata.documentDate,
        content: ata.content,
        file_url: ata.fileUrl,
      },
      siteSettings,
    })
  }
}
