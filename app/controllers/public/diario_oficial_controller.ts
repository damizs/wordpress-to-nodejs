import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import OfficialGazetteEntry from '#models/official_gazette_entry'
import SiteSetting from '#models/site_setting'
import { fixGetpublicUrl } from '#helpers/document_file_url'
import GetPublicService from '#services/getpublic_service'

export default class DiarioOficialController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const search = request.input('busca', '')

    let query = OfficialGazetteEntry.query().orderBy('publication_date', 'desc')
    if (year) {
      const y = Number(year)
      query = query
        .where('publication_date', '>=', `${y}-01-01`)
        .where('publication_date', '<', `${y + 1}-01-01`)
    }
    if (search) {
      query = query.where((q) => {
        q.whereILike('description', `%${search}%`).orWhereILike('edition_number', `%${search}%`)
      })
    }

    const entries = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()
    const latestEntry = await OfficialGazetteEntry.query().orderBy('publication_date', 'desc').first()

    const range = await db
      .from('official_gazette_entries')
      .whereNotNull('publication_date')
      .min('publication_date as min')
      .max('publication_date as max')
      .first()
    const years: number[] = []
    if (range?.min && range?.max) {
      const minY = new Date(range.min).getFullYear()
      const maxY = new Date(range.max).getFullYear()
      for (let y = maxY; y >= minY; y--) years.push(y)
    }

    return inertia.render('public/diario-oficial/index', {
      entries: entries.all().map((e) => ({
        id: e.id,
        edition_number: e.editionNumber,
        date: e.publicationDate,
        description: e.description,
        file_url: fixGetpublicUrl(e.fileUrl),
        viewer_url: GetPublicService.materiaViewerUrl(e.editionNumber),
      })),
      pagination: {
        currentPage: entries.currentPage,
        lastPage: entries.lastPage,
        total: entries.total,
      },
      years,
      filters: { year, search },
      latestEntry: latestEntry
        ? {
            id: latestEntry.id,
            edition_number: latestEntry.editionNumber,
            date: latestEntry.publicationDate,
            description: latestEntry.description,
            file_url: fixGetpublicUrl(latestEntry.fileUrl),
            viewer_url: GetPublicService.materiaViewerUrl(latestEntry.editionNumber),
          }
        : null,
      siteSettings,
    })
  }
}
