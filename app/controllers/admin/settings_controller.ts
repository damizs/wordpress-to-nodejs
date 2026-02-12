import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default class SettingsController {
  /** Show appearance settings */
  async appearance({ inertia }: HttpContext) {
    const settings = await SiteSetting.query().whereIn('group', ['appearance', 'footer', 'social', 'esic'])

    // Group them
    const grouped: Record<string, Array<{ key: string; value: string | null; type: string; label: string | null }>> = {}
    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = []
      grouped[s.group].push({ key: s.key, value: s.value, type: s.type, label: s.label })
    }

    return inertia.render('admin/settings/appearance', { settings: grouped })
  }

  /** Update appearance settings */
  async updateAppearance({ request, response, session }: HttpContext) {
    const fields = request.only([
      'color_navy', 'color_gold', 'color_sky',
      'header_title', 'header_subtitle',
      'footer_address', 'footer_phone', 'footer_email', 'footer_hours',
      'social_facebook', 'social_instagram', 'social_youtube',
      'esic_new_url', 'esic_consult_url', 'esic_phone', 'esic_email',
    ])

    await SiteSetting.bulkUpdate(fields)

    // Handle file uploads (logo, favicon)
    const logo = request.file('logo_url', { size: '2mb', extnames: ['png', 'jpg', 'jpeg', 'svg', 'webp'] })
    if (logo) {
      const uploadDir = join(app.publicPath(), 'uploads')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `logo-${cuid()}.${logo.extname}`
      await logo.move(uploadDir, { name: fileName })
      await SiteSetting.setValue('logo_url', `/uploads/${fileName}`)
    }

    const favicon = request.file('favicon_url', { size: '500kb', extnames: ['png', 'ico', 'svg'] })
    if (favicon) {
      const uploadDir = join(app.publicPath(), 'uploads')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `favicon-${cuid()}.${favicon.extname}`
      await favicon.move(uploadDir, { name: fileName })
      await SiteSetting.setValue('favicon_url', `/uploads/${fileName}`)
    }

    session.flash('success', 'Configurações salvas com sucesso!')
    return response.redirect().back()
  }
}
