import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'

export default class HomepageController {
  async index({ inertia }: HttpContext) {
    const settings = await SiteSetting.query().whereIn('group', [
      'homepage_hero', 'homepage_quickaccess', 'homepage_esic',
      'homepage_transparency', 'homepage_vereadores', 'homepage_diario',
      'homepage_instagram', 'homepage_conheca', 'homepage_seals',
      'homepage_survey', 'homepage_sections',
    ])

    const grouped: Record<string, Record<string, string | null>> = {}
    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = {}
      grouped[s.group][s.key] = s.value
    }

    return inertia.render('admin/homepage/index', { settings: grouped })
  }

  async update({ request, response, session }: HttpContext) {
    const fields = request.all()

    // Filter only known setting keys and update them
    for (const [key, value] of Object.entries(fields)) {
      if (key.startsWith('homepage_') || key.startsWith('section_')) {
        await SiteSetting.query().where('key', key).update({
          value: typeof value === 'string' ? value : JSON.stringify(value),
          updated_at: new Date(),
        })
      }
    }

    session.flash('success', 'Configurações da homepage salvas!')
    return response.redirect().back()
  }
}
