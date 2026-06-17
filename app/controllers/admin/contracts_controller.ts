import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import Licitacao from '#models/licitacao'
import LicitacaoDocument from '#models/licitacao_document'
import { generateSlug } from '#helpers/slug'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { sanitizeRichHtml } from '#helpers/sanitize_html'
import { assertSafeUpload } from '#helpers/upload_security'

const CONTRACT_STATUS = ['vigente', 'encerrado', 'rescindido', 'suspenso']

export default class ContractsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')
    const search = request.input('busca', '')

    let query = Contract.query().orderBy('year', 'desc').orderBy('number', 'desc')
    if (status) query = query.where('status', status)
    if (search) {
      query = query.where((q) => {
        q.whereILike('number', `%${search}%`)
          .orWhereILike('object', `%${search}%`)
          .orWhereILike('contractor_name', `%${search}%`)
          .orWhereILike('fiscal_name', `%${search}%`)
      })
    }

    const contracts = await query.paginate(page, 20)

    // Licitações com anexo "contrato" que ainda não viraram contrato estruturado
    const linkableCount = await this.unlinkedContractDocsCount()

    return inertia.render('admin/contracts/index', {
      contracts: contracts.serialize(),
      filters: { status, search },
      linkableCount,
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/contracts/form', {
      contract: null,
      licitacoes: await this.licitacaoOptions(),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = this.payload(request)
    const slug = await this.uniqueSlug(data)

    const contract = await Contract.create({ ...data, slug })
    await this.saveFile(request, contract)

    session.flash('success', 'Contrato cadastrado com sucesso!')
    return response.redirect().toPath(`/painel/contratos/${contract.id}/editar`)
  }

  async edit({ params, inertia }: HttpContext) {
    const contract = await Contract.findOrFail(params.id)
    return inertia.render('admin/contracts/form', {
      contract: contract.serialize(),
      licitacoes: await this.licitacaoOptions(),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const contract = await Contract.findOrFail(params.id)
    const data = this.payload(request)
    contract.merge(data)
    await this.saveFile(request, contract)
    await contract.save()

    session.flash('success', 'Contrato atualizado!')
    return response.redirect().toPath(`/painel/contratos/${contract.id}/editar`)
  }

  async destroy({ params, response, session }: HttpContext) {
    const contract = await Contract.findOrFail(params.id)
    await contract.delete()
    session.flash('success', 'Contrato excluído!')
    return response.redirect().toPath('/painel/contratos')
  }

  /**
   * Lê os anexos do tipo "contrato" das licitações e gera contratos estruturados
   * pré-preenchidos (objeto, número, ano, PDF e vínculo), prontos para o gestor
   * completar contratante, valor, vigência e fiscal. Idempotente: só cria para
   * licitações que ainda não têm contrato vinculado.
   */
  async importFromLicitacoes({ response, session }: HttpContext) {
    const linkedIds = (
      await Contract.query().whereNotNull('licitacao_id').select('licitacao_id')
    ).map((c) => c.licitacaoId)

    const docs = await LicitacaoDocument.query()
      .where('document_type', 'contrato')
      .preload('licitacao')
      .orderBy('created_at', 'asc')

    let created = 0
    const seen = new Set<number>(linkedIds.filter((id): id is number => id !== null))
    for (const doc of docs) {
      const lic = doc.licitacao
      if (!lic || seen.has(lic.id)) continue
      seen.add(lic.id)

      const base = {
        number: lic.number,
        year: lic.year,
        object: lic.object,
        modality: lic.modality || null,
        status: 'vigente',
        licitacaoId: lic.id,
        fileUrl: doc.fileUrl,
        isActive: true,
        displayOrder: 0,
        contractorName: null,
        contractorDocument: null,
        value: null,
        legalBasis: null,
        signDate: null,
        startDate: null,
        endDate: null,
        term: null,
        managerName: null,
        managerRole: null,
        fiscalName: null,
        fiscalRole: null,
        fiscalAct: null,
        content: null,
        notes: `Importado da licitação "${lic.title}".`,
      }
      const slug = await this.uniqueSlug(base)
      await Contract.create({ ...base, slug })
      created += 1
    }

    session.flash(
      'success',
      created > 0
        ? `${created} contrato(s) importado(s) das licitações. Complete contratante, valor, vigência e fiscal.`
        : 'Nenhum contrato novo para importar — todas as licitações com anexo de contrato já estão vinculadas.'
    )
    return response.redirect().toPath('/painel/contratos')
  }

  /* ============================== Helpers ============================== */

  private payload(request: HttpContext['request']) {
    const d = request.only([
      'number',
      'year',
      'object',
      'contractor_name',
      'contractor_document',
      'value',
      'modality',
      'legal_basis',
      'sign_date',
      'start_date',
      'end_date',
      'term',
      'status',
      'manager_name',
      'manager_role',
      'fiscal_name',
      'fiscal_role',
      'fiscal_act',
      'licitacao_id',
      'content',
      'notes',
      'is_active',
    ])
    return {
      number: d.number || null,
      year: d.year ? Number.parseInt(d.year) : null,
      object: d.object || null,
      contractorName: d.contractor_name || null,
      contractorDocument: d.contractor_document || null,
      value: d.value ? Number.parseFloat(d.value) : null,
      modality: d.modality || null,
      legalBasis: d.legal_basis || null,
      signDate: d.sign_date || null,
      startDate: d.start_date || null,
      endDate: d.end_date || null,
      term: d.term || null,
      status: CONTRACT_STATUS.includes(d.status) ? d.status : 'vigente',
      managerName: d.manager_name || null,
      managerRole: d.manager_role || null,
      fiscalName: d.fiscal_name || null,
      fiscalRole: d.fiscal_role || null,
      fiscalAct: d.fiscal_act || null,
      licitacaoId: d.licitacao_id ? Number.parseInt(d.licitacao_id) : null,
      content: sanitizeRichHtml(d.content) || null,
      notes: d.notes || null,
      isActive: d.is_active === undefined ? true : d.is_active === 'true' || d.is_active === true,
    }
  }

  private async saveFile(request: HttpContext['request'], contract: Contract) {
    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (!file) return
    await assertSafeUpload(file, ['pdf'])
    const uploadDir = join(app.publicPath(), 'uploads', 'contratos')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
    const fileName = `contrato-${cuid()}.${file.extname}`
    await file.move(uploadDir, { name: fileName })
    if (file.state === 'moved') {
      contract.fileUrl = `/uploads/contratos/${fileName}`
      await contract.save()
    }
  }

  private async uniqueSlug(data: { number?: string | null; year?: number | null; contractorName?: string | null }) {
    const base =
      generateSlug(
        `contrato-${data.number || ''}-${data.year || ''}-${data.contractorName || ''}`
      ) || `contrato-${cuid()}`
    let slug = base
    let i = 1
    while (await Contract.findBy('slug', slug)) {
      slug = `${base}-${i++}`
    }
    return slug
  }

  private async licitacaoOptions() {
    const rows = await Licitacao.query()
      .where('is_active', true)
      .orderBy('year', 'desc')
      .orderBy('created_at', 'desc')
      .select('id', 'title', 'number', 'year')
    return rows.map((l) => ({ id: l.id, title: l.title, number: l.number, year: l.year }))
  }

  private async unlinkedContractDocsCount() {
    const linkedIds = (
      await Contract.query().whereNotNull('licitacao_id').select('licitacao_id')
    )
      .map((c) => c.licitacaoId)
      .filter((id): id is number => id !== null)

    const rows = await LicitacaoDocument.query()
      .where('document_type', 'contrato')
      .if(linkedIds.length > 0, (q) => q.whereNotIn('licitacao_id', linkedIds))
      .distinct('licitacao_id')
    return rows.length
  }
}
