import type { HttpContext } from '@adonisjs/core/http'
import OfficialPublication from '#models/official_publication'
import Licitacao from '#models/licitacao'
import SiteSetting from '#models/site_setting'
import { resolveDocumentFileUrl } from '#helpers/document_file_url'

function mapPublication(p: OfficialPublication) {
  const fileUrl = resolveDocumentFileUrl(p.fileUrl, p.description, p.number)
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    date: p.publicationDate,
    type: p.type,
    number: p.number,
    file_url: fileUrl,
    export_url: p.slug ? `/publicacoes-oficiais/${p.slug}/exportar` : null,
  }
}

export default class PublicationsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('tipo', '')
    const year = request.input('ano', '')
    const search = request.input('busca', '')

    let query = OfficialPublication.query().orderBy('publication_date', 'desc')
    if (type) query = query.where('type', type)
    if (year) {
      query = query
        .where('publication_date', '>=', `${year}-01-01`)
        .where('publication_date', '<=', `${year}-12-31`)
    }
    if (search) {
      query = query.where((q) => {
        q.whereILike('title', `%${search}%`)
          .orWhereILike('description', `%${search}%`)
          .orWhereILike('number', `%${search}%`)
      })
    }

    const publications = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()

    const typeRows = await OfficialPublication.query().distinct('type').orderBy('type', 'asc')
    const dateRows = await OfficialPublication.query().select('publication_date')
    const years = Array.from(
      new Set(
        dateRows
          .map((r) => Number(String(r.publicationDate || '').slice(0, 4)))
          .filter((y) => Number.isFinite(y) && y > 1900)
      )
    ).sort((a, b) => b - a)

    return inertia.render('public/publications/index', {
      publications: publications.all().map(mapPublication),
      pagination: {
        currentPage: publications.currentPage,
        lastPage: publications.lastPage,
        total: publications.total,
      },
      filters: { type, year, search },
      types: typeRows.map((r) => r.type).filter(Boolean),
      years,
      siteSettings,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const publication = await OfficialPublication.query().where('slug', params.slug).first()
    if (!publication) {
      const licitacao = await Licitacao.query().where('slug', params.slug).where('is_active', true).first()
      if (licitacao) {
        return response.redirect().status(301).toPath(`/licitacoes/${licitacao.slug}`)
      }
      return response.redirect().status(301).toPath('/publicacoes-oficiais')
    }
    const siteSettings = await SiteSetting.allAsObject()
    const fileUrl = resolveDocumentFileUrl(
      publication.fileUrl,
      publication.description,
      publication.number
    )

    return inertia.render('public/publications/show', {
      publication: {
        id: publication.id,
        title: publication.title,
        slug: publication.slug,
        type: publication.type,
        number: publication.number,
        publicationDate: publication.publicationDate,
        description: publication.description,
        file_url: fileUrl,
      },
      exportUrl: `/publicacoes-oficiais/${publication.slug}/exportar`,
      siteSettings,
    })
  }

  /** Redireciona ao PDF nativo/GetPublic ou abre página para imprimir/salvar como PDF. */
  async export({ params, inertia, response }: HttpContext) {
    const publication = await OfficialPublication.query().where('slug', params.slug).first()
    if (!publication) return response.redirect().status(301).toPath('/publicacoes-oficiais')

    const fileUrl = resolveDocumentFileUrl(
      publication.fileUrl,
      publication.description,
      publication.number
    )
    if (fileUrl) return response.redirect(fileUrl)

    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/publications/export', {
      publication: {
        title: publication.title,
        slug: publication.slug,
        type: publication.type,
        number: publication.number,
        publicationDate: publication.publicationDate,
        description: publication.description,
      },
      siteSettings,
    })
  }
}
