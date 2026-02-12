import type { HttpContext } from '@adonisjs/core/http'
import Licitacao from '#models/licitacao'
import SiteSetting from '#models/site_setting'

export default class LicitacoesController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')
    const modality = request.input('modalidade', '')

    let query = Licitacao.query().where('is_active', true).orderBy('created_at', 'desc')
    if (status) query = query.where('status', status)
    if (modality) query = query.where('modality', modality)

    const licitacoes = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/licitacoes/index', { licitacoes: licitacoes.serialize(), filters: { status, modality }, siteSettings })
  }

  async show({ params, inertia }: HttpContext) {
    const licitacao = await Licitacao.query().where('slug', params.slug).where('is_active', true).firstOrFail()
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/licitacoes/show', { licitacao: licitacao.serialize(), siteSettings })
  }
}
