import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'
import { findPublishedPage, renderPublicPage } from '#controllers/public/pages_controller'

/** Página pública do SIC / Acesso à Informação (critérios PNTP 12.x). */
export default class AcessoInformacaoController {
  async index({ inertia }: HttpContext) {
    const siteSettings = await SiteSetting.allAsObject()
    const esicUrl =
      siteSettings.esic_new_url && siteSettings.esic_new_url !== '#'
        ? siteSettings.esic_new_url
        : 'https://doc3.inf.br/cmsu2516300/esic'

    return inertia.render('public/acesso-informacao/index', {
      siteSettings,
      esicUrl,
    })
  }

  /** Deep-link usado nos cards de transparência: /acesso-a-informacao/lai */
  async lai({ inertia, response }: HttpContext) {
    const page = await findPublishedPage('regulamentacao-lai')
    if (page) {
      return renderPublicPage(inertia, page)
    }
    return response.redirect().status(301).toPath('/perguntas-frequentes')
  }
}
