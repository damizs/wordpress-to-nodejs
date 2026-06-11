import type { HttpContext } from '@adonisjs/core/http'
import OfficialGazetteEntry from '#models/official_gazette_entry'
import SiteSetting from '#models/site_setting'

export default class DiarioOficialController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')

    let query = OfficialGazetteEntry.query().orderBy('publication_date', 'desc')
    if (year) query = query.whereRaw('EXTRACT(YEAR FROM publication_date::date) = ?', [year])

    const entries = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/diario-oficial/index', {
      entries: entries.all().map((e) => ({
        id: e.id,
        edition_number: e.editionNumber,
        date: e.publicationDate,
        description: e.description,
        file_url: e.fileUrl,
      })),
      pagination: {
        currentPage: entries.currentPage,
        lastPage: entries.lastPage,
      },
      filters: { year },
      siteSettings,
    })
  }
}
