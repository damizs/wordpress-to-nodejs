import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { saveOptimizedImage } from '#helpers/image_upload'
import { assertSafeUpload } from '#helpers/upload_security'
import { normalizeSafeWebUrl } from '#helpers/safe_url'

/** All appearance keys with their defaults and groups */
const APPEARANCE_KEYS: Record<
  string,
  { group: string; defaultValue: string; type: string; label: string }
> = {
  color_navy: {
    group: 'appearance',
    defaultValue: '#141b47',
    type: 'color',
    label: 'Cor Principal (Navy)',
  },
  color_gold: {
    group: 'appearance',
    defaultValue: '#d4a017',
    type: 'color',
    label: 'Cor Destaque (Gold)',
  },
  color_sky: {
    group: 'appearance',
    defaultValue: '#272971',
    type: 'color',
    label: 'Cor Secundária (Sky)',
  },
  theme_preset: {
    group: 'appearance',
    defaultValue: 'navy',
    type: 'text',
    label: 'Tema (preset de cores)',
  },
  admin_palette: {
    group: 'appearance',
    defaultValue: 'navy',
    type: 'text',
    label: 'Paleta do painel (cores do admin)',
  },
  campaign_mode: {
    group: 'appearance',
    defaultValue: 'auto',
    type: 'text',
    label: 'Campanha Sazonal (auto | off | chave da campanha)',
  },
  layout_style: {
    group: 'appearance',
    defaultValue: 'institucional',
    type: 'text',
    label: 'Estilo de Layout',
  },
  site_template: {
    group: 'appearance',
    defaultValue: 'institucional',
    type: 'text',
    label: 'Modelo do Site',
  },
  news_layout: {
    group: 'appearance',
    defaultValue: 'mosaico',
    type: 'text',
    label: 'Modelo dos cards de Notícias',
  },
  news_count: {
    group: 'appearance',
    defaultValue: '5',
    type: 'text',
    label: 'Quantidade de cards de Notícias na home',
  },
  template_config: {
    group: 'appearance',
    defaultValue: '{}',
    type: 'json',
    label: 'Configuração avançada por modelo de site',
  },
  header_title: {
    group: 'appearance',
    defaultValue: 'CÂMARA MUNICIPAL DE SUMÉ',
    type: 'text',
    label: 'Título do Header',
  },
  header_subtitle: {
    group: 'appearance',
    defaultValue: 'Estado da Paraíba',
    type: 'text',
    label: 'Subtítulo do Header',
  },
  logo_url: { group: 'appearance', defaultValue: '', type: 'image', label: 'Logo (PNG)' },
  document_brasao_url: {
    group: 'appearance',
    defaultValue: '',
    type: 'image',
    label: 'Brasão (documentos oficiais)',
  },
  favicon_url: { group: 'appearance', defaultValue: '', type: 'image', label: 'Favicon' },
  login_logo_url: {
    group: 'appearance',
    defaultValue: '',
    type: 'image',
    label: 'Logo da tela de login',
  },
  login_title: {
    group: 'appearance',
    defaultValue: 'Painel Administrativo',
    type: 'text',
    label: 'Titulo da tela de login',
  },
  login_subtitle: {
    group: 'appearance',
    defaultValue: 'Camara Municipal de Sume',
    type: 'text',
    label: 'Subtitulo da tela de login',
  },
  dpo_ordinance_pdf_url: {
    group: 'appearance',
    defaultValue: '',
    type: 'text',
    label: 'Portaria do encarregado (PDF)',
  },
  atricon_logo_url: {
    group: 'appearance',
    defaultValue: '',
    type: 'image',
    label: 'Logo ATRICON (Radar)',
  },
  news_background_image: {
    group: 'appearance',
    defaultValue: '',
    type: 'image',
    label: 'Imagem de Fundo - Notícias',
  },
  city_images: {
    group: 'appearance',
    defaultValue: '[]',
    type: 'json',
    label: 'Fotos da Cidade (Carrossel)',
  },
  footer_description: {
    group: 'footer',
    defaultValue: 'Comprometida com a transparência e o bem-estar da população.',
    type: 'text',
    label: 'Descrição (texto abaixo da logo)',
  },
  footer_address: {
    group: 'footer',
    defaultValue: 'Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB',
    type: 'text',
    label: 'Endereço',
  },
  footer_phone: {
    group: 'footer',
    defaultValue: '(83) 3353-1175',
    type: 'text',
    label: 'Telefone',
  },
  footer_email: {
    group: 'footer',
    defaultValue: 'contato@camaradesume.pb.gov.br',
    type: 'text',
    label: 'Email',
  },
  footer_hours: {
    group: 'footer',
    defaultValue: 'Seg a Sex, 8h às 14h',
    type: 'text',
    label: 'Horário',
  },
  social_facebook: { group: 'social', defaultValue: '', type: 'text', label: 'Facebook' },
  social_instagram: { group: 'social', defaultValue: '', type: 'text', label: 'Instagram' },
  social_youtube: { group: 'social', defaultValue: '', type: 'text', label: 'YouTube' },
  esic_new_url: { group: 'esic', defaultValue: '#', type: 'text', label: 'Link Nova Demanda' },
  esic_consult_url: { group: 'esic', defaultValue: '#', type: 'text', label: 'Link Consultar' },
  sic_unit: { group: 'esic', defaultValue: 'Serviço de Informação ao Cidadão (SIC) da Câmara Municipal de Sumé', type: 'text', label: 'Unidade responsável pelo SIC' },
  sic_monitoring_authority: { group: 'esic', defaultValue: 'Presidência da Câmara Municipal de Sumé', type: 'text', label: 'Autoridade de monitoramento' },
  esic_phone: { group: 'esic', defaultValue: '', type: 'text', label: 'Telefone E-SIC' },
  esic_email: { group: 'esic', defaultValue: '', type: 'text', label: 'Email E-SIC' },
}

/** Text field keys (everything except image uploads and special fields) */
const TEXT_KEYS = Object.keys(APPEARANCE_KEYS).filter(
  (k) =>
    ![
      'logo_url',
      'document_brasao_url',
      'favicon_url',
      'login_logo_url',
      'dpo_ordinance_pdf_url',
      'atricon_logo_url',
      'news_background_image',
      'city_images',
    ].includes(k)
)

const URL_TEXT_KEYS = new Set(['social_facebook', 'social_instagram', 'social_youtube', 'esic_new_url', 'esic_consult_url'])

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

    const settings = await SiteSetting.query().whereIn('group', [
      'appearance',
      'footer',
      'social',
      'esic',
    ])

    const grouped: Record<
      string,
      Array<{ key: string; value: string | null; type: string; label: string | null }>
    > = {}
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
          const safeValue = URL_TEXT_KEYS.has(key) ? normalizeSafeWebUrl(value) || '' : String(value)
          await SiteSetting.setValue(key, safeValue, def.group, def.type as any)
        }
      }

      // Handle logo upload
      const logo = request.file('logo_url', {
        size: '2mb',
        extnames: ['png', 'jpg', 'jpeg', 'webp'],
      })
      if (logo) {
        await assertSafeUpload(logo, ['png', 'jpg', 'jpeg', 'webp'])
        const uploadDir = join(app.publicPath(), 'uploads')
        const saved = await saveOptimizedImage(logo, uploadDir, {
          prefix: 'logo',
          publicUrlBase: '/uploads',
          maxWidth: 1200,
          maxHeight: 600,
        })
        await SiteSetting.setValue('logo_url', saved.url, 'appearance', 'image')
      }

      // Handle document brasão upload (timbre dos documentos oficiais)
      const brasao = request.file('document_brasao_url', {
        size: '2mb',
        extnames: ['png', 'jpg', 'jpeg', 'webp'],
      })
      if (brasao) {
        await assertSafeUpload(brasao, ['png', 'jpg', 'jpeg', 'webp'])
        const uploadDir = join(app.publicPath(), 'uploads')
        const saved = await saveOptimizedImage(brasao, uploadDir, {
          prefix: 'brasao',
          publicUrlBase: '/uploads',
          maxWidth: 1200,
          maxHeight: 1200,
        })
        await SiteSetting.setValue('document_brasao_url', saved.url, 'appearance', 'image')
      }

      // Handle favicon upload
      const favicon = request.file('favicon_url', {
        size: '500kb',
        extnames: ['png', 'ico'],
      })
      if (favicon) {
        await assertSafeUpload(favicon, ['png', 'ico'])
        const uploadDir = join(app.publicPath(), 'uploads')
        if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
        const fileName = `favicon-${cuid()}.${favicon.extname}`
        await favicon.move(uploadDir, { name: fileName })
        if (favicon.state === 'moved') {
          await SiteSetting.setValue('favicon_url', `/uploads/${fileName}`, 'appearance', 'image')
        }
      }

      // Handle login logo upload
      const loginLogo = request.file('login_logo_url', {
        size: '2mb',
        extnames: ['png', 'jpg', 'jpeg', 'webp'],
      })
      if (loginLogo) {
        await assertSafeUpload(loginLogo, ['png', 'jpg', 'jpeg', 'webp'])
        const uploadDir = join(app.publicPath(), 'uploads')
        const saved = await saveOptimizedImage(loginLogo, uploadDir, {
          prefix: 'login-logo',
          publicUrlBase: '/uploads',
          maxWidth: 1200,
          maxHeight: 600,
        })
        await SiteSetting.setValue('login_logo_url', saved.url, 'appearance', 'image')
      }

      // Handle DPO ordinance PDF upload
      const dpoOrdinance = request.file('dpo_ordinance_pdf_url', {
        size: '20mb',
        extnames: ['pdf'],
      })
      if (dpoOrdinance) {
        await assertSafeUpload(dpoOrdinance, ['pdf'])
        const uploadDir = join(app.publicPath(), 'uploads', 'lgpd')
        if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
        const fileName = `portaria-encarregado-${cuid()}.pdf`
        await dpoOrdinance.move(uploadDir, { name: fileName })
        if (dpoOrdinance.state === 'moved') {
          await SiteSetting.setValue(
            'dpo_ordinance_pdf_url',
            `/uploads/lgpd/${fileName}`,
            'appearance',
            'text'
          )
        }
      }

      // Handle ATRICON logo upload (Radar)
      const atriconLogo = request.file('atricon_logo_url', {
        size: '2mb',
        extnames: ['png', 'jpg', 'jpeg', 'webp'],
      })
      if (atriconLogo) {
        await assertSafeUpload(atriconLogo, ['png', 'jpg', 'jpeg', 'webp'])
        const uploadDir = join(app.publicPath(), 'uploads')
        const saved = await saveOptimizedImage(atriconLogo, uploadDir, {
          prefix: 'atricon-logo',
          publicUrlBase: '/uploads',
          maxWidth: 1200,
          maxHeight: 1200,
        })
        await SiteSetting.setValue('atricon_logo_url', saved.url, 'appearance', 'image')
      }

      // Handle news background image upload
      const newsBackground = request.file('news_background_image', {
        size: '5mb',
        extnames: ['png', 'jpg', 'jpeg', 'webp'],
      })
      if (newsBackground) {
        await assertSafeUpload(newsBackground, ['png', 'jpg', 'jpeg', 'webp'])
        const uploadDir = join(app.publicPath(), 'uploads')
        const saved = await saveOptimizedImage(newsBackground, uploadDir, {
          prefix: 'news-bg',
          publicUrlBase: '/uploads',
          maxWidth: 2400,
          maxHeight: 1600,
        })
        await SiteSetting.setValue('news_background_image', saved.url, 'appearance', 'image')
      }

      // Handle city images upload (multiple files)
      const cityImageFiles = request.files('city_images', {
        size: '5mb',
        extnames: ['png', 'jpg', 'jpeg', 'webp'],
      })
      if (cityImageFiles && cityImageFiles.length > 0) {
        const uploadDir = join(app.publicPath(), 'uploads', 'cidade')
        if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

        let existingImages: string[] = []
        try {
          const existing = await SiteSetting.getValue('city_images')
          if (existing) existingImages = JSON.parse(existing)
        } catch {
          /* ignore */
        }

        const keepExisting = request.input('keep_existing_city_images') === 'true'
        const newImages: string[] = keepExisting ? existingImages : []

        for (const file of cityImageFiles) {
          await assertSafeUpload(file, ['png', 'jpg', 'jpeg', 'webp'])
          const saved = await saveOptimizedImage(file, uploadDir, {
            prefix: 'cidade',
            publicUrlBase: '/uploads/cidade',
            maxWidth: 1920,
            maxHeight: 1280,
          })
          newImages.push(saved.url)
        }

        await SiteSetting.setValue(
          'city_images',
          JSON.stringify(newImages),
          'appearance',
          'json' as any
        )
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
    } catch {
      /* ignore */
    }

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
      } catch {
        /* ignore */
      }

      // Upload new images
      const newFiles = request.files('city_images', {
        size: '5mb',
        extnames: ['png', 'jpg', 'jpeg', 'webp'],
      })
      const newImages: string[] = []

      if (newFiles && newFiles.length > 0) {
        for (const file of newFiles) {
          await assertSafeUpload(file, ['png', 'jpg', 'jpeg', 'webp'])
          const saved = await saveOptimizedImage(file, uploadDir, {
            prefix: 'cidade',
            publicUrlBase: '/uploads/cidade',
            maxWidth: 1920,
            maxHeight: 1280,
          })
          newImages.push(saved.url)
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImages]
      await SiteSetting.setValue(
        'city_images',
        JSON.stringify(allImages),
        'appearance',
        'json' as any
      )

      session.flash('success', 'Fotos da cidade atualizadas!')
    } catch (error) {
      console.error('Error saving city images:', error)
      session.flash('error', 'Erro ao salvar fotos.')
    }

    return response.redirect().back()
  }
}
