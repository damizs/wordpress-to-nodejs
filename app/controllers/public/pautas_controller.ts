import type { HttpContext } from '@adonisjs/core/http'
import Pauta from '#models/pauta'
import SiteSetting from '#models/site_setting'

export default class PautasController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const type = request.input('tipo', '')
    const search = request.input('busca', '')

    let query = Pauta.query()
      .where('is_published', true)
      .whereNull('deleted_at')
      .orderBy('document_date', 'desc')
    if (year) query = query.where('year', year)
    if (type) query = query.where('type', type)
    if (search) query = query.whereILike('title', `%${search}%`)

    const pautas = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()

    const yearRows = await Pauta.query()
      .where('is_published', true)
      .whereNull('deleted_at')
      .distinct('year')
      .orderBy('year', 'desc')

    const typeRows = await Pauta.query()
      .where('is_published', true)
      .whereNull('deleted_at')
      .whereNotNull('type')
      .distinct('type')
      .orderBy('type', 'asc')

    return inertia.render('public/pautas/index', {
      pautas: pautas.all().map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        date: s.documentDate,
        session_type: s.type,
      })),
      pagination: {
        currentPage: pautas.currentPage,
        lastPage: pautas.lastPage,
        total: pautas.total,
      },
      years: yearRows.map((r) => r.year).filter(Boolean),
      types: typeRows.map((r) => r.type).filter(Boolean),
      filters: { year, type, search },
      siteSettings,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const pauta = await Pauta.query()
      .where('slug', params.slug)
      .where('is_published', true)
      .whereNull('deleted_at')
      .first()
    if (!pauta) return response.redirect().status(301).toPath('/pautas')
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/pautas/show', {
      pauta: {
        id: pauta.id,
        title: pauta.title,
        slug: pauta.slug,
        date: pauta.documentDate,
        time: pauta.docTime,
        content: pauta.content,
        file_url: pauta.fileUrl,
      },
      siteSettings,
    })
  }
}
