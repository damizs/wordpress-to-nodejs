import type { HttpContext } from '@adonisjs/core/http'
import Duodecimo from '#models/duodecimo'
import SiteSetting from '#models/site_setting'

interface DuodecimoRow {
  month: number
  previsto: number
  recebido: number | null
  diferenca: number
  percentual: number
  situacao: 'recebido' | 'pendente'
  repasseDate: string | null
  documentUrl: string | null
}

export default class DuodecimosController {
  async index({ inertia, request }: HttpContext) {
    // Anos distintos disponíveis (mais recente primeiro)
    const yearRows = await Duodecimo.query().distinct('year').orderBy('year', 'desc')
    const years = yearRows.map((r) => r.year)

    // Ano selecionado: query ?ano= ou o mais recente
    const requested = Number.parseInt(request.input('ano', ''))
    const selectedYear =
      requested && years.includes(requested) ? requested : (years[0] ?? new Date().getFullYear())

    const records = await Duodecimo.query().where('year', selectedYear).orderBy('month', 'asc')

    const rows: DuodecimoRow[] = records.map((d) => {
      const previsto = d.previsto ?? 0
      const recebido = d.recebido
      const diferenca = previsto - (recebido ?? 0)
      const percentual = previsto > 0 && recebido !== null ? (recebido / previsto) * 100 : 0
      return {
        month: d.month,
        previsto,
        recebido,
        diferenca,
        percentual,
        situacao: recebido !== null ? 'recebido' : 'pendente',
        repasseDate: d.repasseDate,
        documentUrl: d.documentUrl,
      }
    })

    // Totais do ano
    const totalPrevisto = rows.reduce((s, r) => s + r.previsto, 0)
    const totalRecebido = rows.reduce((s, r) => s + (r.recebido ?? 0), 0)
    const totals = {
      previsto: totalPrevisto,
      recebido: totalRecebido,
      diferenca: totalPrevisto - totalRecebido,
      // % média ponderada = recebido total / previsto total
      percentual: totalPrevisto > 0 ? (totalRecebido / totalPrevisto) * 100 : 0,
    }

    // Última atualização = max(updated_at) de todos os lançamentos
    const lastUpdateRow = await Duodecimo.query().orderBy('updated_at', 'desc').first()
    const lastUpdate = lastUpdateRow?.updatedAt ? lastUpdateRow.updatedAt.toISO() : null

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/duodecimos/index', {
      rows,
      totals,
      years,
      selectedYear,
      lastUpdate,
      siteSettings,
    })
  }
}
