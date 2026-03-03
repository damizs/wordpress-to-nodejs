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
  news_background_image: { group: 'appearance', defaultValue: '', type: 'image', label: 'Imagem de Fundo - Notícias' },
  city_images: { group: 'appearance', defaultValue: '[]', type: 'json', label: 'Fotos da Cidade (Carrossel)' },
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

/** Text field keys (everything except image uploads and special fields) */
const TEXT_KEYS = Object.keys(APPEARANCE_KEYS).filter((k) => !['logo_url', 'favicon_url', 'news_background_image', 'city_images'].includes(k))

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

      // Handle news background image upload
      const newsBackground = request.file('news_background_image', { size: '5mb', extnames: ['png', 'jpg', 'jpeg', 'webp'] })
      if (newsBackground) {
        const uploadDir = join(app.publicPath(), 'uploads')
        if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
        const fileName = `news-bg-${cuid()}.${newsBackground.extname}`
        await newsBackground.move(uploadDir, { name: fileName })
        if (newsBackground.state === 'moved') {
          await SiteSetting.setValue('news_background_image', `/uploads/${fileName}`, 'appearance', 'image')
        }
      }

      // Handle city images upload (multiple files)
      const cityImageFiles = request.files('city_images', { size: '5mb', extnames: ['png', 'jpg', 'jpeg', 'webp'] })
      if (cityImageFiles && cityImageFiles.length > 0) {
        const uploadDir = join(app.publicPath(), 'uploads', 'cidade')
        if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
        
        let existingImages: string[] = []
        try {
          const existing = await SiteSetting.getValue('city_images')
          if (existing) existingImages = JSON.parse(existing)
        } catch { /* ignore */ }
        
        const keepExisting = request.input('keep_existing_city_images') === 'true'
        const newImages: string[] = keepExisting ? existingImages : []
        
        for (const file of cityImageFiles) {
          const fileName = 'cidade-' + cuid() + '.' + file.extname
          await file.move(uploadDir, { name: fileName })
          if (file.state === 'moved') {
            newImages.push('/uploads/cidade/' + fileName)
          }
        }
        
        await SiteSetting.setValue('city_images', JSON.stringify(newImages), 'appearance', 'json' as any)
      }

      session.flash('success', 'Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Error saving settings:', error)
      session.flash('error', 'Erro ao salvar configurações. Tente novamente.')
    }

    return response.redirect().back()
  }

  /** Show city images settings */
  async cityImages({ inertia }: HttpContext) {
    let images: string[] = []
    try {
      const setting = await SiteSetting.getValue('city_images')
      if (setting) images = JSON.parse(setting)
    } catch { /* ignore */ }

    return inertia.render('admin/settings/city-images', { images })
  }

  /** Update city images */
  async updateCityImages({ request, response, session }: HttpContext) {
    try {
      const uploadDir = join(app.publicPath(), 'uploads', 'cidade')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

      // Get existing images to keep
      let existingImages: string[] = []
      try {
        const existingJson = request.input('existing_images')
        if (existingJson) existingImages = JSON.parse(existingJson)
      } catch { /* ignore */ }

      // Upload new images
      const newFiles = request.files('city_images', { size: '5mb', extnames: ['png', 'jpg', 'jpeg', 'webp'] })
      const newImages: string[] = []
      
      if (newFiles && newFiles.length > 0) {
        for (const file of newFiles) {
          const fileName = `cidade-${cuid()}.${file.extname}`
          await file.move(uploadDir, { name: fileName })
          if (file.state === 'moved') {
            newImages.push(`/uploads/cidade/${fileName}`)
          }
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImages]
      await SiteSetting.setValue('city_images', JSON.stringify(allImages), 'appearance', 'json' as any)

      session.flash('success', 'Fotos da cidade atualizadas!')
    } catch (error) {
      console.error('Error saving city images:', error)
      session.flash('error', 'Erro ao salvar fotos.')
    }

    return response.redirect().back()
  }
}
