import type { HttpContext } from '@adonisjs/core/http'
import SatisfactionSurvey from '#models/satisfaction_survey'
import db from '@adonisjs/lucid/services/db'

export default class SatisfactionSurveyController {
  async index({ inertia }: HttpContext) {
    const currentYear = new Date().getFullYear()

    // Get available years for reports
    const yearsResult = await db.rawQuery(
      `SELECT DISTINCT EXTRACT(YEAR FROM created_at)::int as year FROM satisfaction_surveys ORDER BY year DESC`
    )
    const years = yearsResult.rows.map((r: any) => r.year)

    // Get monthly stats for current year
    const monthlyStats = await this._getMonthlyStats(currentYear)

    // Get totals for current year
    const totals = await this._getYearTotals(currentYear)

    return inertia.render('public/pesquisa-satisfacao/index', {
      years: years.length > 0 ? years : [currentYear],
      currentYear,
      monthlyStats,
      totals,
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'cpf',
      'rating_atendimento', 'rating_transparencia',
      'rating_legislativo', 'rating_infraestrutura',
      'rating_geral', 'suggestions',
    ])

    // Check if CPF already voted this month
    if (data.cpf) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const existing = await SatisfactionSurvey.query()
        .where('cpf', data.cpf)
        .where('created_at', '>=', startOfMonth.toISOString())
        .first()

      if (existing) {
        session.flash('error', 'Você já participou da pesquisa neste mês. Volte no próximo mês!')
        return response.redirect().toPath('/pesquisa-de-satisfacao')
      }
    }

    await SatisfactionSurvey.create({
      cpf: data.cpf || null,
      ratingAtendimento: data.rating_atendimento ? parseInt(data.rating_atendimento) : null,
      ratingTransparencia: data.rating_transparencia ? parseInt(data.rating_transparencia) : null,
      ratingLegislativo: data.rating_legislativo ? parseInt(data.rating_legislativo) : null,
      ratingInfraestrutura: data.rating_infraestrutura ? parseInt(data.rating_infraestrutura) : null,
      ratingGeral: parseInt(data.rating_geral) || 3,
      suggestions: data.suggestions || null,
      ipAddress: request.ip(),
      isRead: false,
    })

    session.flash('success', 'Obrigado pela sua participação! Sua opinião é muito importante para nós.')
    return response.redirect().toPath('/pesquisa-de-satisfacao')
  }

  async report({ request, response }: HttpContext) {
    const year = parseInt(request.input('year', new Date().getFullYear()))
    const monthlyStats = await this._getMonthlyStats(year)
    const totals = await this._getYearTotals(year)
    return response.json({ year, monthlyStats, totals })
  }

  private async _getMonthlyStats(year: number) {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      name: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][i],
      responses: 0,
      average: 0,
    }))

    const result = await db.rawQuery(`
      SELECT
        EXTRACT(MONTH FROM created_at)::int as month,
        COUNT(*)::int as responses,
        ROUND(AVG(
          (COALESCE(rating_atendimento, rating_geral) +
           COALESCE(rating_transparencia, rating_geral) +
           COALESCE(rating_legislativo, rating_geral) +
           COALESCE(rating_infraestrutura, rating_geral) +
           rating_geral) / 5.0
        ), 1) as average
      FROM satisfaction_surveys
      WHERE EXTRACT(YEAR FROM created_at) = ?
      GROUP BY month
      ORDER BY month
    `, [year])

    for (const row of result.rows) {
      const m = months[row.month - 1]
      m.responses = row.responses
      m.average = parseFloat(row.average)
    }

    return months
  }

  private async _getYearTotals(year: number) {
    const result = await db.rawQuery(`
      SELECT
        COUNT(*)::int as total,
        ROUND(AVG(
          (COALESCE(rating_atendimento, rating_geral) +
           COALESCE(rating_transparencia, rating_geral) +
           COALESCE(rating_legislativo, rating_geral) +
           COALESCE(rating_infraestrutura, rating_geral) +
           rating_geral) / 5.0
        ), 1) as average
      FROM satisfaction_surveys
      WHERE EXTRACT(YEAR FROM created_at) = ?
    `, [year])

    const row = result.rows[0] || { total: 0, average: 0 }
    return { total: row.total || 0, average: parseFloat(row.average) || 0 }
  }
}
