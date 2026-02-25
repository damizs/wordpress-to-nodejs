import type { HttpContext } from '@adonisjs/core/http'
import InstagramSettings from '#models/instagram_settings'
import InstagramImport from '#models/instagram_import'
import NewsCategory from '#models/news_category'
import InstagramImportService from '#services/instagram_import_service'
import AIProcessorService from '#services/ai_processor_service'

export default class InstagramController {
  /**
   * Dashboard do Instagram
   */
  async index({ inertia }: HttpContext) {
    const settings = await InstagramSettings.getSettings()
    const categories = await NewsCategory.query().orderBy('name')

    // Últimas importações
    const recentImports = await InstagramImport.query()
      .orderBy('importedAt', 'desc')
      .limit(10)

    // Estatísticas
    const totalImported = await InstagramImport.query().whereNotNull('newsId').count('* as total')
    const importedToday = await InstagramImport.query()
      .whereNotNull('newsId')
      .whereRaw('DATE(imported_at) = CURRENT_DATE')
      .count('* as total')
    const errors = await InstagramImport.query()
      .whereNotNull('errorMessage')
      .count('* as total')

    return inertia.render('admin/instagram/index', {
      settings,
      categories,
      recentImports,
      stats: {
        totalImported: Number(totalImported[0]?.$extras?.total || 0),
        importedToday: Number(importedToday[0]?.$extras?.total || 0),
        errors: Number(errors[0]?.$extras?.total || 0),
      },
    })
  }

  /**
   * Página de configurações
   */
  async settings({ inertia }: HttpContext) {
    const settings = await InstagramSettings.getSettings()
    const categories = await NewsCategory.query().orderBy('name')

    return inertia.render('admin/instagram/settings', {
      settings,
      categories,
      defaultPrompt: AIProcessorService.DEFAULT_PROMPT,
    })
  }

  /**
   * Salvar configurações
   */
  async saveSettings({ request, response, session }: HttpContext) {
    const settings = await InstagramSettings.getSettings()

    // Instagram config
    settings.instagramProfileUrl = request.input('instagram_profile_url')
    settings.instagramSessionid = request.input('instagram_sessionid')
    settings.instagramUseragent = request.input('instagram_useragent')
    settings.rapidapiKey = request.input('rapidapi_key')

    // AI config
    settings.aiProvider = request.input('ai_provider', 'gemini')
    settings.aiApiKey = request.input('ai_api_key')
    settings.aiModel = request.input('ai_model', 'gemini-2.0-flash')
    settings.aiPrompt = request.input('ai_prompt')

    // Publishing defaults
    settings.defaultCategoryId = request.input('default_category_id') || null
    settings.defaultStatus = request.input('default_status', 'draft')
    settings.downloadImages = request.input('download_images') === 'on'
    settings.preventDuplicates = request.input('prevent_duplicates') === 'on'

    // Auto import config
    settings.autoImportEnabled = request.input('auto_import_enabled') === 'on'
    settings.autoImportInterval = request.input('auto_import_interval', 'daily')
    settings.autoImportLimit = Number(request.input('auto_import_limit', 5))
    settings.cronTime = request.input('cron_time', '08:00')
    settings.importOnlyToday = request.input('import_only_today') === 'on'

    await settings.save()

    session.flash('success', 'Configurações salvas com sucesso!')
    return response.redirect().back()
  }

  /**
   * Buscar posts do Instagram (preview)
   */
  async fetchPosts({ response }: HttpContext) {
    const service = new InstagramImportService()
    const result = await service.fetchPosts()

    return response.json(result)
  }

  /**
   * Processar legenda com IA (preview)
   */
  async processCaption({ request, response }: HttpContext) {
    const caption = request.input('caption')

    if (!caption) {
      return response.json({ success: false, error: 'Legenda não informada' })
    }

    try {
      const service = new AIProcessorService()
      const result = await service.processCaption(caption)

      return response.json({ success: true, ...result })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Testar conexão com IA
   */
  async testAiConnection({ response }: HttpContext) {
    const service = new AIProcessorService()
    const result = await service.testConnection()

    return response.json(result)
  }

  /**
   * Publicar um post específico
   */
  async publishPost({ request, response, auth }: HttpContext) {
    const post = request.input('post')

    if (!post) {
      return response.json({ success: false, error: 'Post não informado' })
    }

    const service = new InstagramImportService()

    try {
      // Importa um post específico
      const result = await service.importPosts({
        limit: 1,
        onlyToday: false,
        isAutoImport: false,
        userId: auth.user?.id,
      })

      return response.json({
        ...result,
        success: result.imported > 0,
      })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Executar importação automática
   */
  async runAutoImport({ response, auth }: HttpContext) {
    const service = new InstagramImportService()

    const result = await service.importPosts({
      isAutoImport: false,
      userId: auth.user?.id,
    })

    return response.json(result)
  }

  /**
   * Histórico de importações
   */
  async history({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const onlyErrors = request.input('only_errors') === 'true'

    const query = InstagramImport.query()
      .orderBy('importedAt', 'desc')

    if (onlyErrors) {
      query.whereNotNull('errorMessage')
    }

    const imports = await query.paginate(page, 20)

    return inertia.render('admin/instagram/history', {
      imports: imports.serialize(),
      onlyErrors,
    })
  }

  /**
   * Excluir registro de importação
   */
  async deleteImport({ params, response, session }: HttpContext) {
    const importLog = await InstagramImport.find(params.id)

    if (importLog) {
      await importLog.delete()
      session.flash('success', 'Registro excluído com sucesso!')
    }

    return response.redirect().back()
  }
}
