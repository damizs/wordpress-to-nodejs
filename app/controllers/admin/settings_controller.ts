import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

/** All appearance keys with their defaults and groups */
const APPEARANCE_KEYS: Record<string, { group: string; defaultValue: string; type: string; label: string }> = {
  color_navy: { group: 'appearance', defaultValue: '#0a3d62', type: 'color', label: 'Cor Principal (Navy)' },
  color_gold: { group: 'appearance', defaultValue: '#d4a017', type: 'color', label: 'Cor Destaque (Gold)' },
  color_sky: { group: 'appearance', defaultValue: '#2e86de', type: 'color', label: 'Cor Secundária (Sky)' },
  header_title: { group: 'appearance', defaultValue: 'CÂMARA MUNICIPAL DE SUMÉ', type: 'text', label: 'Título do Header' },
  header_subtitle: { group: 'appearance', defaultValue: 'Estado da Paraíba', type: 'text', label: 'Subtítulo do Header' },
  logo_url: { group: 'appearance', defaultValue: '', type: 'image', label: 'Logo (PNG)' },
  favicon_url: { group: 'appearance', defaultValue: '', type: 'image', label: 'Favicon' },
  footer_address: { group: 'footer', defaultValue: 'Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB', type: 'text', label: 'Endereço' },
  footer_phone: { group: 'footer', defaultValue: '(83) 3353-1175', type: 'text', label: 'Telefone' },
  footer_email: { group: 'footer', defaultValue: 'contato@camaradesume.pb.gov.br', type: 'text', label: 'Email' },
  footer_hours: { group: 'footer', defaultValue: 'Seg a Sex, 8h às 14h', type: 'text', label: 'Horário' },
  social_facebook: { group: 'social', defaultValue: '', type: 'text', label: 'Facebook' },
  social_instagram: { group: 'social', defaultValue: '', type: 'text', label: 'Instagram' },
  social_youtube: { group: 'social', defaultValue: '', type: 'text', label: 'YouTube' },
  esic_new_url: { group: 'esic', defaultValue: '#', type: 'text', label: 'Link Nova Demanda' },
  esic_consult_url: { group: 'esic', defaultValue: '#', type: 'text', label: 'Link Consultar' },
  esic_phone: { group: 'esic', defaultValue: '', type: 'text', label: 'Telefone E-SIC' },
  esic_email: { group: 'esic', defaultValue: '', type: 'text', label: 'Email E-SIC' },
}

/** Text field keys (everything except logo/favicon which are file uploads) */
const TEXT_KEYS = Object.keys(APPEARANCE_KEYS).filter((k) => k !== 'logo_url' && k !== 'favicon_url')

export default class SettingsController {
  /** Ensure all settings exist in DB, creating missing ones with defaults */
  private async ensureAllSettings() {
    const existing = await SiteSetting.query().whereIn('key', Object.keys(APPEARANCE_KEYS))
    const existingKeys = new Set(existing.map((s) => s.key))

    for (const [key, def] of Object.entries(APPEARANCE_KEYS)) {
      if (!existingKeys.has(key)) {
        await SiteSetting.create({
          group: def.group,
          key,
          value: def.defaultValue || null,
          type: def.type as any,
          label: def.label,
        })
      }
    }
  }

  /** Show appearance settings */
  async appearance({ inertia }: HttpContext) {
    // Ensure all keys exist in DB
    await this.ensureAllSettings()

    const settings = await SiteSetting.query().whereIn('group', ['appearance', 'footer', 'social', 'esic'])

    const grouped: Record<string, Array<{ key: string; value: string | null; type: string; label: string | null }>> = {}
    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = []
      grouped[s.group].push({ key: s.key, value: s.value, type: s.type, label: s.label })
    }

    return inertia.render('admin/settings/appearance', { settings: grouped })
  }

  /** Update appearance settings */
  async updateAppearance({ request, response, session }: HttpContext) {
    try {
      // Process text fields - only update non-null values
      for (const key of TEXT_KEYS) {
        const value = request.input(key)
        // Only update if the field was actually sent (not null/undefined)
        if (value !== null && value !== undefined) {
          const def = APPEARANCE_KEYS[key]
          await SiteSetting.setValue(key, String(value), def.group, def.type as any)
        }
      }

      // Handle logo upload
      const logo = request.file('logo_url', { size: '2mb', extnames: ['png', 'jpg', 'jpeg', 'svg', 'webp'] })
      if (logo) {
        const uploadDir = join(app.publicPath(), 'uploads')
        if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
        const fileName = `logo-${cuid()}.${logo.extname}`
        await logo.move(uploadDir, { name: fileName })
        if (logo.state === 'moved') {
          await SiteSetting.setValue('logo_url', `/uploads/${fileName}`, 'appearance', 'image')
        }
      }

      // Handle favicon upload
      const favicon = request.file('favicon_url', { size: '500kb', extnames: ['png', 'ico', 'svg'] })
      if (favicon) {
        const uploadDir = join(app.publicPath(), 'uploads')
        if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
        const fileName = `favicon-${cuid()}.${favicon.extname}`
        await favicon.move(uploadDir, { name: fileName })
        if (favicon.state === 'moved') {
          await SiteSetting.setValue('favicon_url', `/uploads/${fileName}`, 'appearance', 'image')
        }
      }

      session.flash('success', 'Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Error saving settings:', error)
      session.flash('error', 'Erro ao salvar configurações. Tente novamente.')
    }

    return response.redirect().back()
  }
}
