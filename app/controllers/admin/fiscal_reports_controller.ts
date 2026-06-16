import type { HttpContext } from '@adonisjs/core/http'
import FiscalReport from '#models/fiscal_report'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

const REPORT_TYPES = ['RGF', 'RREO']
const PERIOD_KINDS = ['bimestre', 'trimestre', 'quadrimestre', 'semestre', 'anual']

/** Quantos períodos cabem em cada granularidade (para validar o número). */
const PERIODS_IN: Record<string, number> = {
  bimestre: 6,
  trimestre: 4,
  quadrimestre: 3,
  semestre: 2,
  anual: 1,
}

const ORDINAL = ['', '1º', '2º', '3º', '4º', '5º', '6º']

function periodLabel(kind: string, num: number | null): string {
  if (kind === 'anual' || !num) return 'Anual'
  const ord = ORDINAL[num] ?? `${num}º`
  return `${ord} ${kind.charAt(0).toUpperCase()}${kind.slice(1)}`
}

export default class FiscalReportsController {
  async index({ inertia, request }: HttpContext) {
    const type = request.input('tipo', '')
    const year = request.input('ano', '')

    let query = FiscalReport.query()
      .orderBy('year', 'desc')
      .orderBy('report_type', 'asc')
      .orderBy('period_number', 'asc')
    if (type) query = query.where('report_type', type)
    if (year) query = query.where('year', year)

    const reports = await query

    const yearRows = await FiscalReport.query().distinct('year').orderBy('year', 'desc')

    return inertia.render('admin/fiscal-reports/index', {
      reports: reports.map((r) => ({
        ...r.serialize(),
        periodLabel: periodLabel(r.periodKind, r.periodNumber),
      })),
      filters: { type, year },
      years: yearRows.map((r) => r.year),
      types: REPORT_TYPES,
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/fiscal-reports/form', {
      report: null,
      types: REPORT_TYPES,
      periodKinds: PERIOD_KINDS,
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = this.payload(request)
    const report = await FiscalReport.create(data)
    await this.saveFile(request, report)

    session.flash('success', 'Relatório fiscal cadastrado!')
    return response.redirect().toPath('/painel/relatorios-fiscais')
  }

  async edit({ params, inertia }: HttpContext) {
    const report = await FiscalReport.findOrFail(params.id)
    return inertia.render('admin/fiscal-reports/form', {
      report: report.serialize(),
      types: REPORT_TYPES,
      periodKinds: PERIOD_KINDS,
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const report = await FiscalReport.findOrFail(params.id)
    report.merge(this.payload(request))
    await this.saveFile(request, report)
    await report.save()

    session.flash('success', 'Relatório fiscal atualizado!')
    return response.redirect().toPath('/painel/relatorios-fiscais')
  }

  async destroy({ params, response, session }: HttpContext) {
    const report = await FiscalReport.findOrFail(params.id)
    await report.delete()
    session.flash('success', 'Relatório fiscal excluído!')
    return response.redirect().toPath('/painel/relatorios-fiscais')
  }

  /* ============================== Helpers ============================== */

  private payload(request: HttpContext['request']) {
    const d = request.only([
      'report_type',
      'year',
      'period_kind',
      'period_number',
      'title',
      'description',
      'is_active',
    ])
    const reportType = REPORT_TYPES.includes(d.report_type) ? d.report_type : 'RGF'
    const periodKind = PERIOD_KINDS.includes(d.period_kind) ? d.period_kind : 'quadrimestre'
    const year = d.year ? Number.parseInt(d.year) : new Date().getFullYear()

    let periodNumber: number | null = null
    if (periodKind !== 'anual' && d.period_number) {
      const n = Number.parseInt(d.period_number)
      const maxN = PERIODS_IN[periodKind] ?? 12
      if (Number.isFinite(n) && n >= 1 && n <= maxN) periodNumber = n
    }

    const title =
      (d.title && String(d.title).trim()) ||
      `${reportType} — ${periodLabel(periodKind, periodNumber)}/${year}`

    return {
      reportType,
      year,
      periodKind,
      periodNumber,
      title,
      description: d.description || null,
      isActive: d.is_active === undefined ? true : d.is_active === 'true' || d.is_active === true,
    }
  }

  private async saveFile(request: HttpContext['request'], report: FiscalReport) {
    const file = request.file('file', { size: '30mb', extnames: ['pdf'] })
    if (!file) return
    const uploadDir = join(app.publicPath(), 'uploads', 'relatorios-fiscais')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
    const fileName = `rgf-${cuid()}.${file.extname}`
    await file.move(uploadDir, { name: fileName })
    if (file.state === 'moved') {
      report.fileUrl = `/uploads/relatorios-fiscais/${fileName}`
      await report.save()
    }
  }
}
