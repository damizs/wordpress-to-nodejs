import type { HttpContext } from '@adonisjs/core/http'
import SatisfactionSurvey from '#models/satisfaction_survey'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default class AdminSatisfactionSurveyController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const isRead = request.input('lido', '')

    let query = SatisfactionSurvey.query().orderBy('created_at', 'desc')
    if (isRead === 'true') query = query.where('is_read', true)
    if (isRead === 'false') query = query.where('is_read', false)

    const surveys = await query.paginate(page, 20)

    // Stats
    const stats = await db
      .from('satisfaction_surveys')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('COALESCE(AVG(rating_geral), 0) as avg_geral'),
        db.raw('COALESCE(AVG(rating_atendimento), 0) as avg_atendimento'),
        db.raw('COALESCE(AVG(rating_transparencia), 0) as avg_transparencia'),
        db.raw('COALESCE(AVG(rating_legislativo), 0) as avg_legislativo'),
        db.raw('COALESCE(AVG(rating_infraestrutura), 0) as avg_infraestrutura'),
        db.raw('COUNT(*) FILTER (WHERE is_read = false) as unread')
      )
      .first()

    // Relatório por período (quantitativo por ano + por mês — como no plugin)
    const yearRows = await db
      .from('satisfaction_surveys')
      .select(db.raw('EXTRACT(YEAR FROM created_at)::int as year'), db.raw('COUNT(*) as total'))
      .groupByRaw('EXTRACT(YEAR FROM created_at)')
      .orderBy('year', 'desc')
    const years = yearRows.map((r: any) => ({ year: Number(r.year), total: Number(r.total) }))
    const selectedYear = Number(request.input('ano', years[0]?.year || DateTime.now().year))

    const monthRows = await db
      .from('satisfaction_surveys')
      .select(
        db.raw('EXTRACT(MONTH FROM created_at)::int as month'),
        db.raw('COUNT(*) as total'),
        db.raw('COALESCE(ROUND(AVG(rating_geral), 1), 0) as avg')
      )
      .whereRaw('EXTRACT(YEAR FROM created_at) = ?', [selectedYear])
      .groupByRaw('EXTRACT(MONTH FROM created_at)')
    const monthMap = new Map<number, { total: number; avg: number }>(
      monthRows.map((r: any) => [Number(r.month), { total: Number(r.total), avg: Number(r.avg) }])
    )
    const monthly = MESES_PT.map((label, i) => {
      const d = monthMap.get(i + 1)
      return { month: i + 1, label, total: d?.total || 0, avg: d?.avg || 0 }
    })
    const yearTotal = monthly.reduce((s, m) => s + m.total, 0)
    const weighted = monthly.reduce((s, m) => s + m.avg * m.total, 0)
    const yearAvg = yearTotal > 0 ? Number((weighted / yearTotal).toFixed(1)) : 0

    return inertia.render('admin/pesquisa-satisfacao/index', {
      surveys: surveys.serialize(),
      stats: {
        total: Number(stats?.total || 0),
        unread: Number(stats?.unread || 0),
        avg_geral: Number(Number(stats?.avg_geral || 0).toFixed(1)),
        avg_atendimento: Number(Number(stats?.avg_atendimento || 0).toFixed(1)),
        avg_transparencia: Number(Number(stats?.avg_transparencia || 0).toFixed(1)),
        avg_legislativo: Number(Number(stats?.avg_legislativo || 0).toFixed(1)),
        avg_infraestrutura: Number(Number(stats?.avg_infraestrutura || 0).toFixed(1)),
      },
      report: { years, selectedYear, monthly, yearTotal, yearAvg },
      filters: { isRead },
    })
  }

  async show({ params, inertia }: HttpContext) {
    const survey = await SatisfactionSurvey.findOrFail(params.id)
    if (!survey.isRead) {
      survey.isRead = true
      await survey.save()
    }
    return inertia.render('admin/pesquisa-satisfacao/show', { survey: survey.serialize() })
  }

  async destroy({ params, response, session }: HttpContext) {
    const survey = await SatisfactionSurvey.findOrFail(params.id)
    await survey.delete()
    session.flash('success', 'Resposta excluída!')
    return response.redirect().toPath('/painel/pesquisa-satisfacao')
  }
}
