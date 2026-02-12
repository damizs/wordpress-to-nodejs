import type { HttpContext } from '@adonisjs/core/http'
import SatisfactionSurvey from '#models/satisfaction_survey'
import db from '@adonisjs/lucid/services/db'

export default class AdminSatisfactionSurveyController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const isRead = request.input('lido', '')

    let query = SatisfactionSurvey.query().orderBy('created_at', 'desc')
    if (isRead === 'true') query = query.where('is_read', true)
    if (isRead === 'false') query = query.where('is_read', false)

    const surveys = await query.paginate(page, 20)

    // Stats
    const stats = await db.from('satisfaction_surveys')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('COALESCE(AVG(rating_geral), 0) as avg_geral'),
        db.raw('COALESCE(AVG(rating_atendimento), 0) as avg_atendimento'),
        db.raw('COALESCE(AVG(rating_transparencia), 0) as avg_transparencia'),
        db.raw('COALESCE(AVG(rating_legislativo), 0) as avg_legislativo'),
        db.raw('COALESCE(AVG(rating_infraestrutura), 0) as avg_infraestrutura'),
        db.raw("COUNT(*) FILTER (WHERE is_read = false) as unread"),
      )
      .first()

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
