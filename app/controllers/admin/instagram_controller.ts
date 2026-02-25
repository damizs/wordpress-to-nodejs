import type { HttpContext } from '@adonisjs/core/http'
import InstagramImportSetting from '#models/instagram_import_setting'
import InstagramImportLog from '#models/instagram_import_log'
import InstagramAutoImporterService from '#services/instagram_auto_importer_service'
import NewsCategory from '#models/news_category'

export default class InstagramController {
  /**
   * Dashboard principal
   */
  async index({ inertia }: HttpContext) {
    const settings = await InstagramImportSetting.getAll()
    const logs = await InstagramImportLog.query()
      .orderBy('created_at', 'desc')
      .limit(10)
      .preload('news')

    const stats = {
      total: await InstagramImportLog.query().count('* as total'),
      success: await InstagramImportLog.query().whereNotNull('news_id').count('* as total'),
      errors: await InstagramImportLog.query().where('status', 'error').count('* as total'),
      today: await InstagramImportLog.query()
        .whereRaw('DATE(created_at) = CURRENT_DATE')
        .count('* as total'),
    }

    return inertia.render('admin/noticias/automacao/index', {
      settings,
      logs,
      stats: {
        total: Number(stats.total[0].$extras.total),
        success: Number(stats.success[0].$extras.total),
        errors: Number(stats.errors[0].$extras.total),
        today: Number(stats.today[0].$extras.total),
      },
    })
  }

  /**
   * Configurações
   */
  async settings({ inertia }: HttpContext) {
    const settings = await InstagramImportSetting.getAll()
    const categories = await NewsCategory.query().orderBy('name', 'asc')

    return inertia.render('admin/noticias/automacao/settings', {
      settings,
      categories,
      aiProviders: [
        { value: 'gemini', label: 'Google Gemini' },
        { value: 'openai', label: 'OpenAI GPT' },
        { value: 'claude', label: 'Anthropic Claude' },
      ],
      aiModels: {
        gemini: [
          { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recomendado)' },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
        ],
        openai: [
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Recomendado)' },
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        ],
        claude: [
          { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recomendado)' },
          { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
        ],
      },
    })
  }

  /**
   * Salvar configurações
   */
  async saveSettings({ request, response, session }: HttpContext) {
    const data = request.only([
      'instagram_profile_url',
      'instagram_sessionid',
      'instagram_useragent',
      'rapidapi_key',
      'ai_provider',
      'ai_api_key',
      'ai_model',
      'ai_prompt',
      'default_category',
      'default_status',
      'auto_import_enabled',
      'auto_import_limit',
      'cron_mode',
      'cron_hour',
      'cron_minute',
    ])

    for (const [key, value] of Object.entries(data)) {
      await InstagramImportSetting.set(key, value as string)
    }

    session.flash('success', 'Configurações salvas com sucesso!')
    return response.redirect().back()
  }

  /**
   * Histórico de importação
   */
  async history({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')

    let query = InstagramImportLog.query()
      .orderBy('created_at', 'desc')
      .preload('news')
      .preload('user')

    if (status) {
      query = query.where('status', status)
    }

    const logs = await query.paginate(page, 20)

    return inertia.render('admin/noticias/automacao/history', {
      logs: logs.serialize(),
    })
  }

  /**
   * Carregar posts do Instagram
   */
  async fetchPosts({ response }: HttpContext) {
    try {
      const service = new InstagramAutoImporterService()
      const posts = await service.fetchPosts()

      // Verificar quais já foram importados
      const importedIds = await InstagramImportLog.getImportedIds()

      const postsWithStatus = posts.map(post => ({
        ...post,
        isImported: importedIds.includes(post.id),
      }))

      return response.json({ success: true, posts: postsWithStatus })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Publicar post individual
   */
  async publishPost({ request, response, auth }: HttpContext) {
    try {
      const { post } = request.only(['post'])
      const service = new InstagramAutoImporterService()
      const news = await service.importSinglePost(post, auth.user?.id)

      if (news) {
        return response.json({
          success: true,
          message: 'Notícia publicada com sucesso!',
          newsId: news.id,
        })
      } else {
        return response.json({ success: false, error: 'Erro ao publicar notícia' })
      }
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Executar importação automática manualmente
   */
  async runAutoImport({ response }: HttpContext) {
    try {
      const service = new InstagramAutoImporterService()
      const result = await service.runAutoImport()

      return response.json({
        success: true,
        imported: result.imported,
        errors: result.errors,
        message: result.imported > 0
          ? `${result.imported} post(s) importado(s) com sucesso!`
          : 'Nenhum post novo de hoje para importar',
      })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Testar conexão com IA
   */
  async testAiConnection({ response }: HttpContext) {
    try {
      const service = new InstagramAutoImporterService()
      const result = await service.testAIConnection()

      return response.json({
        success: result.success,
        error: result.error,
        message: result.success ? 'Conexão com IA funcionando!' : result.error,
      })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Processar legenda com IA
   */
  async processCaption({ request, response }: HttpContext) {
    try {
      const { caption } = request.only(['caption'])
      
      // Usar AIProcessor diretamente
      const AIProcessorService = (await import('#services/ai_processor_service')).default
      const ai = new AIProcessorService()
      const result = await ai.processCaption(caption)

      return response.json({
        success: true,
        title: result.title,
        content: result.content,
        tokensUsed: result.tokensUsed,
      })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Deletar importação
   */
  async deleteImport({ params, response, session }: HttpContext) {
    const log = await InstagramImportLog.find(params.id)
    if (log) {
      await log.delete()
      session.flash('success', 'Log removido com sucesso!')
    }
    return response.redirect().back()
  }
}
