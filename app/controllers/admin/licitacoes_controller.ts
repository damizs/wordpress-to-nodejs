import type { HttpContext } from '@adonisjs/core/http'
import Licitacao from '#models/licitacao'
import LicitacaoDocument from '#models/licitacao_document'
import { generateSlug } from '#helpers/slug'
import { DOCUMENT_TYPES, MODALITY_CHECKLIST } from '#helpers/licitacao_documents'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/** Extensões aceitas para documentos do processo licitatório */
const DOC_EXTNAMES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'odt', 'ods', 'zip', 'png', 'jpg', 'jpeg']

export default class LicitacoesController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')
    const modality = request.input('modality', '')
    const search = String(request.input('search', '') || '').trim()

    let query = Licitacao.query().orderBy('created_at', 'desc')
    if (status) query = query.where('status', status)
    if (modality) query = query.where('modality', modality)
    if (search) {
      query = query.where((builder) => {
        builder
          .whereILike('title', `%${search}%`)
          .orWhereILike('number', `%${search}%`)
          .orWhereILike('object', `%${search}%`)
      })
    }

    const licitacoes = await query.paginate(page, 20)
    return inertia.render('admin/licitacoes/index', {
      licitacoes: licitacoes.serialize(),
      filters: { status, modality, search },
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/licitacoes/form', {
      licitacao: null,
      documents: [],
      documentTypes: DOCUMENT_TYPES,
      modalityChecklist: MODALITY_CHECKLIST,
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title',
      'number',
      'modality',
      'status',
      'object',
      'content',
      'estimated_value',
      'opening_date',
      'closing_date',
      'year',
    ])

    const slug =
      request.input('slug') || generateSlug(`${data.title}${data.number ? '-' + data.number : ''}`)

    const licitacao = await Licitacao.create({
      title: data.title,
      slug,
      number: data.number || null,
      modality: data.modality || null,
      status: data.status || 'aberta',
      object: data.object || null,
      content: data.content || null,
      estimatedValue: data.estimated_value ? Number.parseFloat(data.estimated_value) : null,
      openingDate: data.opening_date || null,
      closingDate: data.closing_date || null,
      year: data.year ? Number.parseInt(data.year) : new Date().getFullYear(),
      isActive: true,
    })

    await this.saveDocuments(request, licitacao.id)

    session.flash('success', 'Licitação cadastrada com sucesso!')
    return response.redirect().toPath(`/painel/licitacoes/${licitacao.id}/editar`)
  }

  async edit({ params, inertia }: HttpContext) {
    const licitacao = await Licitacao.findOrFail(params.id)
    const documents = await LicitacaoDocument.query()
      .where('licitacao_id', licitacao.id)
      .orderBy('display_order', 'asc')
      .orderBy('created_at', 'asc')

    return inertia.render('admin/licitacoes/form', {
      licitacao: licitacao.serialize(),
      documents: documents.map((d) => d.serialize()),
      documentTypes: DOCUMENT_TYPES,
      modalityChecklist: MODALITY_CHECKLIST,
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const licitacao = await Licitacao.findOrFail(params.id)
    const data = request.only([
      'title',
      'number',
      'modality',
      'status',
      'object',
      'content',
      'estimated_value',
      'opening_date',
      'closing_date',
      'year',
      'is_active',
    ])

    licitacao.merge({
      title: data.title,
      number: data.number || null,
      modality: data.modality || null,
      status: data.status || 'aberta',
      object: data.object || null,
      content: data.content || null,
      estimatedValue: data.estimated_value ? Number.parseFloat(data.estimated_value) : null,
      openingDate: data.opening_date || null,
      closingDate: data.closing_date || null,
      year: data.year ? Number.parseInt(data.year) : null,
      isActive: data.is_active === 'true' || data.is_active === true,
    })
    await licitacao.save()

    await this.saveDocuments(request, licitacao.id)

    session.flash('success', 'Licitação atualizada!')
    return response.redirect().toPath(`/painel/licitacoes/${licitacao.id}/editar`)
  }

  async destroy({ params, response, session }: HttpContext) {
    const licitacao = await Licitacao.findOrFail(params.id)
    await licitacao.delete()
    session.flash('success', 'Licitação excluída!')
    return response.redirect().toPath('/painel/licitacoes')
  }

  /** Remove um documento individual */
  async destroyDocument({ params, response, session }: HttpContext) {
    const doc = await LicitacaoDocument.findOrFail(params.id)
    await doc.delete()
    session.flash('success', 'Documento removido!')
    return response.redirect().back()
  }

  /**
   * Salva os documentos enviados no form (quantidade ilimitada).
   * O frontend envia arrays paralelos: doc_files[], doc_types[], doc_titles[].
   */
  private async saveDocuments(request: HttpContext['request'], licitacaoId: number) {
    const files = request.files('doc_files', { size: '50mb', extnames: DOC_EXTNAMES })
    if (!files || files.length === 0) return

    const rawTypes = request.input('doc_types', [])
    const rawTitles = request.input('doc_titles', [])
    const types: string[] = Array.isArray(rawTypes) ? rawTypes : [rawTypes]
    const titles: string[] = Array.isArray(rawTitles) ? rawTitles : [rawTitles]

    const uploadDir = join(app.publicPath(), 'uploads', 'licitacoes')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

    const lastOrder = await LicitacaoDocument.query()
      .where('licitacao_id', licitacaoId)
      .max('display_order as max')
      .first()
    let order = Number(lastOrder?.$extras.max || 0)

    for (const [i, file] of files.entries()) {
      if (!file) continue
      const fileName = `lic-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      if (file.state !== 'moved') continue

      const type = types[i] && DOCUMENT_TYPES[types[i]] ? types[i] : 'outros'
      order += 1
      await LicitacaoDocument.create({
        licitacaoId,
        documentType: type,
        title: titles[i]?.trim() || file.clientName.replace(/\.[^.]+$/, ''),
        fileUrl: `/uploads/licitacoes/${fileName}`,
        displayOrder: order,
      })
    }
  }
}
