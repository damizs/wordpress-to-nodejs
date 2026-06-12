import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'
import InstitutionalContent from '#models/institutional_content'

export default class StaticPagesController {
  private async getSettings() {
    const settings = await SiteSetting.all()
    const map: Record<string, string | null> = {}
    for (const s of settings) {
      map[s.key] = s.value
    }
    return map
  }

  /** Conteúdo institucional editável pelo painel, mapeado por key */
  private async getInstitutional(keys: string[]) {
    const rows = await InstitutionalContent.query().whereIn('key', keys)
    const map: Record<string, { title: string; content: string }> = {}
    for (const r of rows) {
      map[r.key] = { title: r.title, content: r.content }
    }
    return map
  }

  async historia({ inertia }: HttpContext) {
    const siteSettings = await this.getSettings()
    const institutional = await this.getInstitutional([
      'historia_intro',
      'historia_trajetoria',
      'historia_poder_legislativo',
      'historia_transparencia',
    ])
    return inertia.render('public/historia-da-camara/index', { siteSettings, institutional })
  }

  async ouvidoria({ inertia }: HttpContext) {
    const siteSettings = await this.getSettings()
    return inertia.render('public/ouvidoria/index', { siteSettings })
  }

  async sobre({ inertia }: HttpContext) {
    const siteSettings = await this.getSettings()
    const institutional = await this.getInstitutional([
      'sobre_missao',
      'sobre_visao',
      'sobre_valores',
      'sobre_intro',
      'sobre_atribuicoes',
    ])
    return inertia.render('public/sobre/index', { siteSettings, institutional })
  }
}
