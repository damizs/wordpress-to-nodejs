import type { HttpContext } from '@adonisjs/core/http'
import FiscalReport from '#models/fiscal_report'
import SiteSetting from '#models/site_setting'

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
      .where('is_active', true)
      .orderBy('year', 'desc')
      .orderBy('report_type', 'asc')
      .orderBy('period_number', 'asc')
    if (type) query = query.where('report_type', type)
    if (year) query = query.where('year', year)

    const reports = await query

    const yearRows = await FiscalReport.query()
      .where('is_active', true)
      .distinct('year')
      .orderBy('year', 'desc')
    const typeRows = await FiscalReport.query()
      .where('is_active', true)
      .distinct('report_type')
      .orderBy('report_type', 'asc')

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/fiscal-reports/index', {
      reports: reports.map((r) => ({
        id: r.id,
        reportType: r.reportType,
        year: r.year,
        periodKind: r.periodKind,
        periodNumber: r.periodNumber,
        periodLabel: periodLabel(r.periodKind, r.periodNumber),
        title: r.title,
        description: r.description,
        fileUrl: r.fileUrl,
      })),
      filters: { type, year },
      years: yearRows.map((r) => r.year),
      types: typeRows.map((r) => r.reportType),
      siteSettings,
    })
  }
}
