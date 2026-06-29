import type { HttpContext } from '@adonisjs/core/http'
import InstagramSetting from '#models/instagram_setting'
import InstagramImportLog from '#models/instagram_import_log'
import InstagramAutoImporterService from '#services/instagram_auto_importer_service'
import NewsCategory from '#models/news_category'

const SECRET_SETTING_KEYS = new Set(['instagram_sessionid', 'rapidapi_key', 'ai_api_key'])

export default class InstagramController {
  private redactSecrets(settings: Record<string, string | null>) {
    const redacted = { ...settings }
    for (const key of SECRET_SETTING_KEYS) {
      redacted[key] = null
      redacted[`${key}_set`] = settings[key] ? 'true' : 'false'
    }
    return redacted
  }

  /**
   * Dashboard principal
   */
  async index({ inertia }: HttpContext) {
    const settings = this.redactSecrets(await InstagramSetting.getAll())
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

    return inertia.render('admin/news/instagram/index', {
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
   * Página de configurações
   */
  async settings({ inertia }: HttpContext) {
    const settings = this.redactSecrets(await InstagramSetting.getAll())
    const categories = await NewsCategory.query().orderBy('name', 'asc')

    return inertia.render('admin/news/instagram/settings', {
      settings,
      categories,
      aiProviders: [
        { value: 'deepseek', label: 'DeepSeek (Recomendado)' },
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
        deepseek: [
          { value: 'deepseek-chat', label: 'DeepSeek Chat (V3 - Recomendado)' },
          { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner (R1)' },
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
      defaultPrompt: InstagramSetting.DEFAULT_PROMPT,
    })
  }

  /**
   * Salvar configurações
   */
  async saveSettings({ request, response, session }: HttpContext) {
    const data = request.only([
      'instagram_profile_url',
      'instagram_scraper_provider',
      'instagram_sessionid',
      'instagram_useragent',
      'rapidapi_key',
      'posts_fetch_count',
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
      const normalized = typeof value === 'string' ? value.trim() : value
      if (SECRET_SETTING_KEYS.has(key) && !normalized) continue
      await InstagramSetting.set(key, normalized as string | null)
    }

    session.flash('success', 'Configurações salvas com sucesso!')
    return response.redirect().back()
  }

  /**
   * Histórico de importações
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

    return inertia.render('admin/news/instagram/history', {
      logs: logs.serialize(),
      filters: { status },
    })
  }

  /**
   * Buscar posts do Instagram via RapidAPI
   */
  async fetchPosts({ response }: HttpContext) {
    try {
      const service = new InstagramAutoImporterService()
      const posts = await service.fetchPosts()

      // Get already imported IDs
      const importedIds = await InstagramImportLog.getImportedIds()

      // Mark which posts are already imported
      const postsWithStatus = posts.map((post) => ({
        ...post,
        isImported: importedIds.includes(post.id),
      }))

      const newCount = postsWithStatus.filter((p) => !p.isImported).length

      return response.json({
        success: true,
        posts: postsWithStatus,
        total: posts.length,
        newCount,
        importedIds,
      })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Publicar um único post
   */
  async publishPost({ request, response, auth }: HttpContext) {
    try {
      const { post, title, content } = request.only(['post', 'title', 'content'])
      const service = new InstagramAutoImporterService()

      // Se título e conteúdo foram fornecidos, usar diretamente (sem chamar IA)
      const news = await service.importSinglePost(post, auth.user?.id, title, content)

      if (news) {
        return response.json({
          success: true,
          message: 'Notícia publicada com sucesso!',
          newsId: news.id,
          title: news.title,
        })
      } else {
        return response.json({ success: false, error: 'Erro ao publicar notícia' })
      }
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Importação automática (posts do dia)
   */
  async runAutoImport({ response }: HttpContext) {
    try {
      const service = new InstagramAutoImporterService()
      const result = await service.runAutoImport()

      return response.json({
        success: true,
        imported: result.imported,
        errors: result.errors,
        posts: result.posts,
        message:
          result.imported > 0
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
   * Processar legenda com IA (preview)
   */
  async processCaption({ request, response }: HttpContext) {
    try {
      const { caption } = request.only(['caption'])

      const { default: AIProcessorService } = await import('#services/ai_processor_service')
      const ai = new AIProcessorService()
      await ai.init()
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
   * Atualizar o feed ao vivo exibido na home ("Siga-nos")
   */
  async refreshFeed({ response }: HttpContext) {
    try {
      const { default: InstagramFeedService } = await import('#services/instagram_feed_service')
      const count = await InstagramFeedService.refresh()
      let reels = 0
      let reelsError = ''
      try {
        reels = await InstagramFeedService.refreshReels()
      } catch (e: any) {
        reelsError = e.message
      }
      return response.json({
        success: true,
        count,
        reels,
        message:
          `Feed atualizado: ${count} publicação(ões), ${reels} reel(s).` +
          (reelsError ? ` (reels: ${reelsError})` : ''),
      })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Deletar log de importação
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
