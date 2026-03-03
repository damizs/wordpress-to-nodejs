import type { HttpContext } from '@adonisjs/core/http'
import InstagramSetting from '#models/instagram_setting'
import InstagramImportLog from '#models/instagram_import_log'
import InstagramAutoImporterService from '#services/instagram_auto_importer_service'
import AIProcessorService from '#services/ai_processor_service'
import NewsCategory from '#models/news_category'

export default class InstagramController {
  /**
   * Dashboard - main page with posts grid
   */
  async index({ inertia }: HttpContext) {
    const settings = await InstagramSetting.getAll()
    const stats = await InstagramImportLog.getStats()
    const logs = await InstagramImportLog.query()
      .orderBy('createdAt', 'desc')
      .limit(10)
      .preload('news')

    return inertia.render('admin/instagram/index', {
      settings,
      stats,
      recentLogs: logs.map(log => ({
        id: log.id,
        instagramId: log.instagramId,
        title: log.generatedTitle,
        status: log.status,
        newsId: log.newsId,
        createdAt: log.createdAt.toFormat('dd/MM/yyyy HH:mm'),
        error: log.errorMessage,
      })),
    })
  }

  /**
   * Settings page
   */
  async settings({ inertia }: HttpContext) {
    const settings = await InstagramSetting.getAll()
    const categories = await NewsCategory.query().orderBy('name', 'asc')

    return inertia.render('admin/instagram/settings', {
      settings,
      categories: categories.map(c => ({ id: c.id, name: c.name })),
      defaultPrompt: InstagramSetting.DEFAULT_PROMPT,
    })
  }

  /**
   * Save settings
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
      'posts_fetch_count',
      'auto_import_enabled',
      'auto_import_limit',
      'cron_mode',
      'cron_hour',
      'cron_minute',
    ])

    await InstagramSetting.setMany(data as Record<string, string | null>)

    session.flash('success', 'Configurações salvas com sucesso!')
    return response.redirect().back()
  }

  /**
   * History page with pagination
   */
  async history({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')

    let query = InstagramImportLog.query()
      .orderBy('createdAt', 'desc')
      .preload('news')
      .preload('user')

    if (status) {
      query = query.where('status', status)
    }

    const logs = await query.paginate(page, 20)

    return inertia.render('admin/instagram/history', {
      logs: logs.serialize(),
    })
  }

  /**
   * Fetch posts from Instagram
   */
  async fetchPosts({ response }: HttpContext) {
    try {
      const service = new InstagramAutoImporterService()
      const posts = await service.fetchPosts()

      // Check which are already imported
      const importedIds = await InstagramImportLog.getImportedIds()

      const postsWithStatus = posts.map(post => ({
        id: post.id,
        shortcode: post.shortcode,
        thumbnailSrc: post.thumbnailSrc,
        displayUrl: post.displayUrl,
        caption: post.caption,
        takenAtTimestamp: post.takenAtTimestamp,
        isVideo: post.isVideo,
        isImported: importedIds.includes(post.id),
      }))

      return response.json({ success: true, posts: postsWithStatus })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Publish a single post
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
   * Publish multiple posts automatically
   */
  async publishMultiple({ request, response, auth }: HttpContext) {
    try {
      const { posts } = request.only(['posts'])
      const service = new InstagramAutoImporterService()
      
      const results = {
        success: 0,
        errors: 0,
        items: [] as Array<{ id: string; title?: string; newsId?: number; error?: string }>,
      }

      for (const post of posts) {
        try {
          const news = await service.importSinglePost(post, auth.user?.id)
          if (news) {
            results.success++
            results.items.push({ id: post.id, title: news.title, newsId: news.id })
          }
        } catch (error: any) {
          results.errors++
          results.items.push({ id: post.id, error: error.message })
        }
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      return response.json({
        success: true,
        message: `${results.success} post(s) publicado(s), ${results.errors} erro(s)`,
        results,
      })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Run auto import manually
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
        posts: result.posts,
      })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Test AI connection
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
   * Process caption with AI (preview)
   */
  async processCaption({ request, response }: HttpContext) {
    try {
      const { caption } = request.only(['caption'])
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
   * Delete import log
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
