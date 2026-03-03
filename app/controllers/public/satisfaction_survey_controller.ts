import type { HttpContext } from '@adonisjs/core/http'
import SatisfactionSurvey from '#models/satisfaction_survey'
import SiteSetting from '#models/site_setting'
import db from '@adonisjs/lucid/services/db'

export default class SatisfactionSurveyController {
  // Default questions
  private defaultQuestions = [
    { id: 1, numero: 1, texto: 'Como você avalia a atuação da Câmara Municipal na fiscalização do Poder Executivo?' },
    { id: 2, numero: 2, texto: 'Qual seu nível de satisfação com a transparência das atividades da Câmara Municipal?' },
    { id: 3, numero: 3, texto: 'Como você avalia o trabalho dos vereadores na proposição de leis e projetos em benefício da população?' },
    { id: 4, numero: 4, texto: 'Qual seu nível de satisfação com as informações disponíveis no site da Câmara Municipal?' },
    { id: 5, numero: 5, texto: 'Ao ser atendido(a) na Câmara Municipal, o(a) funcionário(a) demonstra interesse em resolver seu problema?' },
  ]

  async index({ inertia }: HttpContext) {
    const currentYear = new Date().getFullYear()
    const siteSettings = await SiteSetting.allAsObject()

    // Get available years for reports
    let years = [currentYear]
    try {
      const yearsResult = await db.rawQuery(
        `SELECT DISTINCT EXTRACT(YEAR FROM created_at)::int as year FROM satisfaction_surveys ORDER BY year DESC`
      )
      if (yearsResult.rows.length > 0) {
        years = yearsResult.rows.map((r: any) => r.year)
      }
    } catch (e) {
      // Table might not exist yet
    }

    // Get monthly stats for current year chart
    const monthlyStats = await this._getMonthlyStats(currentYear)

    return inertia.render('pesquisa-satisfacao', {
      questions: this.defaultQuestions,
      serviceTypes: ['Atendimento Presencial', 'Portal de Transparência', 'Serviços Online', 'Ouvidoria', 'Outro'],
      siteSettings,
      currentYear,
      availableYears: years.length > 0 ? years : [currentYear, currentYear - 1, currentYear - 2, currentYear - 3],
      monthlyStats,
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['cpf', 'answers', 'suggestion'])

    // Check if CPF already voted this month
    if (data.cpf) {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      try {
        const existing = await SatisfactionSurvey.query()
          .where('cpf', data.cpf)
          .where('created_at', '>=', startOfMonth.toISOString())
          .first()

        if (existing) {
          session.flash('error', 'Você já participou da pesquisa neste mês. Volte no próximo mês!')
          return response.redirect().toPath('/pesquisa-de-satisfacao')
        }
      } catch (e) {
        // Continue if table doesn't exist
      }
    }

    // Calculate average from answers
    const answers = data.answers || {}
    const values = Object.values(answers).map(v => Number(v)).filter(v => !isNaN(v))
    const avgRating = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 3

    try {
      await SatisfactionSurvey.create({
        cpf: data.cpf || null,
        ratingAtendimento: answers[5] ? parseInt(answers[5]) : null,
        ratingTransparencia: answers[2] ? parseInt(answers[2]) : null,
        ratingLegislativo: answers[3] ? parseInt(answers[3]) : null,
        ratingInfraestrutura: answers[4] ? parseInt(answers[4]) : null,
        ratingGeral: avgRating,
        suggestions: data.suggestion || null,
        ipAddress: request.ip(),
        isRead: false,
      })
    } catch (e) {
      console.log('Error saving survey:', e)
    }

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
      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      responses: 0,
      average: 0,
    }))

    try {
      const result = await db.rawQuery(`
        SELECT
          EXTRACT(MONTH FROM created_at)::int as month,
          COUNT(*)::int as responses,
          ROUND(AVG(rating_geral), 1) as average
        FROM satisfaction_surveys
        WHERE EXTRACT(YEAR FROM created_at) = ?
        GROUP BY month
        ORDER BY month
      `, [year])

      for (const row of result.rows) {
        const m = months[row.month - 1]
        m.responses = row.responses
        m.average = parseFloat(row.average) || 0
      }
    } catch (e) {
      // Table might not exist
    }

    return months
  }

  private async _getYearTotals(year: number) {
    try {
      const result = await db.rawQuery(`
        SELECT
          COUNT(*)::int as total,
          ROUND(AVG(rating_geral), 1) as average
        FROM satisfaction_surveys
        WHERE EXTRACT(YEAR FROM created_at) = ?
      `, [year])

      const row = result.rows[0] || { total: 0, average: 0 }
      return { total: row.total || 0, average: parseFloat(row.average) || 0 }
    } catch (e) {
      return { total: 0, average: 0 }
    }
  }
}
