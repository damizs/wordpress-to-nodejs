import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Contract from '#models/contract'
import SiteSetting from '#models/site_setting'

export default class ContractsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')
    const year = request.input('ano', '')
    const search = request.input('busca', '')

    let query = Contract.query()
      .where('is_active', true)
      .orderBy('year', 'desc')
      .orderBy('number', 'desc')
    if (status) query = query.where('status', status)
    if (year) query = query.where('year', year)
    if (search) {
      query = query.where((q) => {
        q.whereILike('number', `%${search}%`)
          .orWhereILike('object', `%${search}%`)
          .orWhereILike('contractor_name', `%${search}%`)
          .orWhereILike('fiscal_name', `%${search}%`)
      })
    }

    const contracts = await query.paginate(page, 20)

    const yearRows = await Contract.query()
      .where('is_active', true)
      .whereNotNull('year')
      .distinct('year')
      .orderBy('year', 'desc')
    const statusRows = await Contract.query()
      .where('is_active', true)
      .whereNotNull('status')
      .distinct('status')
      .orderBy('status', 'asc')

    // Estatísticas globais (independem dos filtros) para os KPIs + gráfico por ano.
    const base = () => db.from('contracts').where('is_active', true)
    const [totalRow, vigRow, valRow, yearAgg] = await Promise.all([
      base().count('* as c').first(),
      base().where('status', 'vigente').count('* as c').first(),
      base().sum('value as s').first(),
      base().whereNotNull('year').select('year').count('* as c').groupBy('year').orderBy('year', 'asc'),
    ])
    const stats = {
      total: Number(totalRow?.c ?? 0),
      vigentes: Number(vigRow?.c ?? 0),
      totalValue: Number(valRow?.s ?? 0),
      byYear: (yearAgg as Array<{ year: number; c: number }>).map((r) => ({
        year: Number(r.year),
        count: Number(r.c),
      })),
    }

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/contracts/index', {
      stats,
      contracts: contracts.all().map((c) => ({
        id: c.id,
        slug: c.slug,
        number: c.number,
        year: c.year,
        object: c.object,
        modality: c.modality,
        contractorName: c.contractorName,
        value: c.value,
        startDate: c.startDate,
        endDate: c.endDate,
        term: c.term,
        status: c.status,
        fiscalName: c.fiscalName,
        managerName: c.managerName,
        fiscalAct: c.fiscalAct,
        hasFile: !!c.fileUrl,
      })),
      pagination: {
        currentPage: contracts.currentPage,
        lastPage: contracts.lastPage,
        total: contracts.total,
      },
      filters: { status, year, search },
      years: yearRows.map((r) => r.year).filter(Boolean),
      statuses: statusRows.map((r) => r.status).filter(Boolean),
      siteSettings,
    })
  }

  async show({ params, inertia, response }: HttpContext) {
    const contract = await Contract.query()
      .where('slug', params.slug)
      .where('is_active', true)
      .preload('licitacao')
      .first()
    if (!contract) return response.redirect().status(301).toPath('/contratos')

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/contracts/show', {
      contract: {
        ...contract.serialize({ relations: {} }),
        licitacao: contract.licitacao
          ? { slug: contract.licitacao.slug, title: contract.licitacao.title, number: contract.licitacao.number }
          : null,
      },
      siteSettings,
    })
  }
}
