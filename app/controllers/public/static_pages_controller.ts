import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'

export default class StaticPagesController {
  private async getSettings() {
    const settings = await SiteSetting.all()
    const map: Record<string, string | null> = {}
    for (const s of settings) {
      map[s.key] = s.value
    }
    return map
  }

  async historia({ inertia }: HttpContext) {
    const siteSettings = await this.getSettings()
    return inertia.render('public/historia/index', { siteSettings })
  }

  async ouvidoria({ inertia }: HttpContext) {
    const siteSettings = await this.getSettings()
    return inertia.render('public/ouvidoria/index', { siteSettings })
  }

  async sobre({ inertia }: HttpContext) {
    const siteSettings = await this.getSettings()
    return inertia.render('public/sobre/index', { siteSettings })
  }
}
