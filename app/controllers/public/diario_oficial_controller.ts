import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import OfficialGazetteEntry from '#models/official_gazette_entry'
import SiteSetting from '#models/site_setting'
import { fixGetpublicUrl } from '#helpers/document_file_url'

export default class DiarioOficialController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const search = request.input('busca', '')

    let query = OfficialGazetteEntry.query().orderBy('publication_date', 'desc')
    if (year) query = query.whereRaw('EXTRACT(YEAR FROM publication_date::date) = ?', [year])
    if (search) {
      query = query.where((q) => {
        q.whereILike('description', `%${search}%`).orWhereILike('edition_number', `%${search}%`)
      })
    }

    const entries = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()
    const latestEntry = await OfficialGazetteEntry.query().orderBy('publication_date', 'desc').first()

    const yearRows: Array<{ year: number }> = await db
      .from('official_gazette_entries')
      .select(db.raw('DISTINCT EXTRACT(YEAR FROM publication_date::date)::int AS year'))
      .orderBy('year', 'desc')

    return inertia.render('public/diario-oficial/index', {
      entries: entries.all().map((e) => ({
        id: e.id,
        edition_number: e.editionNumber,
        date: e.publicationDate,
        description: e.description,
        file_url: fixGetpublicUrl(e.fileUrl),
      })),
      pagination: {
        currentPage: entries.currentPage,
        lastPage: entries.lastPage,
        total: entries.total,
      },
      years: yearRows.map((r) => r.year).filter(Boolean),
      filters: { year, search },
      latestEntry: latestEntry
        ? {
            id: latestEntry.id,
            edition_number: latestEntry.editionNumber,
            date: latestEntry.publicationDate,
            description: latestEntry.description,
            file_url: fixGetpublicUrl(latestEntry.fileUrl),
          }
        : null,
      siteSettings,
    })
  }
}
