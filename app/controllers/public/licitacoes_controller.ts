import type { HttpContext } from '@adonisjs/core/http'
import Licitacao from '#models/licitacao'
import SiteSetting from '#models/site_setting'
import { DOCUMENT_TYPES, checklistFor } from '#helpers/licitacao_documents'

export default class LicitacoesController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')
    const modality = request.input('modalidade', '')
    const year = request.input('ano', '')
    const search = request.input('busca', '')

    let query = Licitacao.query().where('is_active', true).orderBy('created_at', 'desc')
    if (status) query = query.where('status', status)
    if (modality) query = query.where('modality', modality)
    if (year) query = query.where('year', year)
    if (search) {
      query = query.where((q) => {
        q.whereILike('title', `%${search}%`)
          .orWhereILike('number', `%${search}%`)
          .orWhereILike('object', `%${search}%`)
      })
    }

    const licitacoes = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()

    const yearRows = await Licitacao.query()
      .where('is_active', true)
      .whereNotNull('year')
      .distinct('year')
      .orderBy('year', 'desc')
    const modalityRows = await Licitacao.query()
      .where('is_active', true)
      .whereNotNull('modality')
      .distinct('modality')
      .orderBy('modality', 'asc')

    return inertia.render('public/licitacoes/index', {
      licitacoes: licitacoes.all().map((l) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        number: l.number,
        modality: l.modality,
        date: l.openingDate || l.createdAt?.toISODate() || null,
        status: l.status,
      })),
      pagination: {
        currentPage: licitacoes.currentPage,
        lastPage: licitacoes.lastPage,
        total: licitacoes.total,
      },
      filters: { status, modality, year, search },
      years: yearRows.map((r) => r.year).filter(Boolean),
      modalities: modalityRows.map((r) => r.modality).filter(Boolean),
      siteSettings,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const licitacao = await Licitacao.query()
      .where('slug', params.slug)
      .where('is_active', true)
      .preload('documents', (q) => q.orderBy('display_order', 'asc'))
      .first()
    if (!licitacao) return response.redirect().status(301).toPath('/licitacoes')
    const siteSettings = await SiteSetting.allAsObject()

    // Agrupa documentos por fase, na ordem do checklist da modalidade
    const phaseOrder = checklistFor(licitacao.modality)
    const groups: Array<{ type: string; label: string; files: any[] }> = []
    for (const type of [...phaseOrder, 'outros']) {
      const files = licitacao.documents.filter((d) => d.documentType === type)
      if (files.length === 0) continue
      groups.push({
        type,
        label: DOCUMENT_TYPES[type] || type,
        files: files.map((d) => ({ id: d.id, title: d.title, url: d.fileUrl })),
      })
    }

    return inertia.render('public/licitacoes/show', {
      licitacao: {
        ...licitacao.serialize({ relations: {} }),
        date: licitacao.openingDate || licitacao.createdAt?.toISODate() || null,
        // Compatibilidade: PDF único antigo aparece como anexo avulso
        attachments: licitacao.fileUrl
          ? [{ id: 0, name: 'Edital (PDF)', url: licitacao.fileUrl }]
          : [],
      },
      documentGroups: groups,
      siteSettings,
    })
  }
}
