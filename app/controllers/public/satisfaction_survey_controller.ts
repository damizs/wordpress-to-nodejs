import type { HttpContext } from '@adonisjs/core/http'
import SatisfactionSurvey from '#models/satisfaction_survey'
import SiteSetting from '#models/site_setting'

export default class SatisfactionSurveyController {
  async index({ inertia }: HttpContext) {
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/pesquisa-satisfacao/index', { siteSettings, submitted: false })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'name', 'email', 'phone',
      'rating_atendimento', 'rating_transparencia',
      'rating_legislativo', 'rating_infraestrutura',
      'rating_geral', 'suggestions', 'complaints',
    ])

    await SatisfactionSurvey.create({
      name: data.name || null,
      email: data.email || null,
      phone: data.phone || null,
      ratingAtendimento: data.rating_atendimento ? parseInt(data.rating_atendimento) : null,
      ratingTransparencia: data.rating_transparencia ? parseInt(data.rating_transparencia) : null,
      ratingLegislativo: data.rating_legislativo ? parseInt(data.rating_legislativo) : null,
      ratingInfraestrutura: data.rating_infraestrutura ? parseInt(data.rating_infraestrutura) : null,
      ratingGeral: parseInt(data.rating_geral) || 3,
      suggestions: data.suggestions || null,
      complaints: data.complaints || null,
      ipAddress: request.ip(),
      isRead: false,
    })

    session.flash('success', 'Obrigado pela sua participação! Sua opinião é muito importante para nós.')
    return response.redirect().toPath('/pesquisa-de-satisfacao')
  }
}
