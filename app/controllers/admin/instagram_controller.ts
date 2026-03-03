import type { HttpContext } from '@adonisjs/core/http'
import InstagramSetting from '#models/instagram_setting'
import InstagramImportLog from '#models/instagram_import_log'
import InstagramScraperService from '#services/instagram_scraper_service'
import AIProcessorService from '#services/ai_processor_service'
import NewsCategory from '#models/news_category'
import News from '#models/news'
import { DateTime } from 'luxon'
import fs from 'node:fs'
import path from 'node:path'

export default class InstagramController {
  /**
   * Dashboard principal
   */
  async index({ inertia }: HttpContext) {
    const settings = await InstagramSetting.getAll()
    const logs = await InstagramImportLog.query()
      .orderBy('created_at', 'desc')
      .limit(10)
      .preload('news')

    const stats = {
      total: await InstagramImportLog.query().count('* as total'),
      success: await InstagramImportLog.query().whereNotNull('news_id').count('* as total'),
      errors: await InstagramImportLog.query().where('status', 'error').count('* as total'),
      today: await InstagramImportLog.query()
        .whereRaw("DATE(created_at) = CURRENT_DATE")
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
   * Configurações
   */
  async settings({ inertia }: HttpContext) {
    const settings = await InstagramSetting.getAll()
    const categories = await NewsCategory.query().orderBy('name', 'asc')

    return inertia.render('admin/news/instagram/settings', {
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
      'posts_fetch_count',
      'auto_import_enabled',
      'auto_import_limit',
      'cron_mode',
      'cron_hour',
      'cron_minute',
    ])

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        await InstagramSetting.set(key, String(value))
      }
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

    return inertia.render('admin/news/instagram/history', {
      logs: logs.serialize(),
    })
  }

  /**
   * Carregar posts do Instagram (AJAX)
   */
  async fetchPosts({ response }: HttpContext) {
    try {
      const profileUrl = await InstagramSetting.get('instagram_profile_url')
      
      if (!profileUrl) {
        return response.json({ success: false, error: 'URL do perfil não configurada' })
      }

      const scraper = new InstagramScraperService()
      const posts = await scraper.getPostsFromProfile(profileUrl)

      // Obter IDs já importados
      const importedIds = await InstagramImportLog.getImportedIds()

      // Contar posts novos
      const newCount = posts.filter(p => !importedIds.includes(p.id)).length

      return response.json({
        success: true,
        posts,
        importedIds,
        total: posts.length,
        newCount,
        debug: scraper.getDebugInfo()
      })
    } catch (error: any) {
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Publicar post individual com IA
   */
  async publishPost({ request, response, auth }: HttpContext) {
    try {
      const { post } = request.only(['post'])
      const postData = typeof post === 'string' ? JSON.parse(post) : post

      // Verificar se já foi importado
      const alreadyImported = await InstagramImportLog.isImported(postData.id)
      if (alreadyImported) {
        return response.json({ success: false, error: 'Este post já foi importado' })
      }

      // Processar com IA
      const ai = new AIProcessorService()
      const caption = postData.caption || 'Publicação do Instagram'
      const generated = await ai.processCaption(caption)

      if (!generated.title) {
        return response.json({ success: false, error: 'Falha ao gerar título com IA' })
      }

      // Obter configurações
      const categoryId = await InstagramSetting.get('default_category')
      const defaultStatus = await InstagramSetting.get('default_status', 'draft') || 'draft'

      // Baixar imagem primeiro
      let coverImageUrl: string | null = null
      const imageUrl = postData.displayUrl || postData.thumbnailSrc
      if (imageUrl) {
        try {
          coverImageUrl = await this.downloadAndSaveImage(imageUrl)
        } catch (imgError) {
          console.error('Erro ao baixar imagem:', imgError)
        }
      }

      // Criar notícia
      const news = await News.create({
        title: generated.title,
        content: generated.content,
        excerpt: generated.content.substring(0, 200),
        slug: this.generateSlug(generated.title),
        status: defaultStatus as 'draft' | 'published',
        categoryId: categoryId ? parseInt(categoryId) : null,
        authorId: auth.user?.id,
        coverImageUrl,
        publishedAt: postData.takenAtTimestamp 
          ? DateTime.fromSeconds(postData.takenAtTimestamp)
          : DateTime.now()
      })

      // Salvar log
      await InstagramImportLog.create({
        instagramId: postData.id,
        instagramShortcode: postData.shortcode,
        instagramUrl: `https://instagram.com/p/${postData.shortcode}`,
        instagramCaption: postData.caption,
        instagramImageUrl: imageUrl,
        instagramPostDate: postData.takenAtTimestamp 
          ? DateTime.fromSeconds(postData.takenAtTimestamp)
          : null,
        generatedTitle: generated.title,
        generatedContent: generated.content,
        aiProvider: await InstagramSetting.get('ai_provider'),
        aiModel: await InstagramSetting.get('ai_model'),
        aiTokensUsed: generated.tokensUsed,
        newsId: news.id,
        status: defaultStatus === 'published' ? 'published' : 'draft',
        categoryId: categoryId ? parseInt(categoryId) : null,
        importedBy: auth.user?.id || null
      })

      return response.json({
        success: true,
        message: 'Notícia publicada com sucesso!',
        newsId: news.id,
        title: generated.title
      })
    } catch (error: any) {
      console.error('Erro ao publicar post:', error)
      return response.json({ success: false, error: error.message })
    }
  }

  /**
   * Executar importação automática manualmente
   */
  async runAutoImport({ response, auth }: HttpContext) {
    try {
      const profileUrl = await InstagramSetting.get('instagram_profile_url')
      
      if (!profileUrl) {
        return response.json({ success: false, error: 'URL do perfil não configurada' })
      }

      // Buscar posts
      const scraper = new InstagramScraperService()
      const posts = await scraper.getPostsFromProfile(profileUrl)

      if (posts.length === 0) {
        return response.json({
          success: true,
          imported: 0,
          errors: 0,
          message: 'Nenhum post encontrado no perfil'
        })
      }

      // Obter IDs já importados
      const importedIds = await InstagramImportLog.getImportedIds()

      // Filtrar posts de hoje (fuso de Brasília)
      const now = DateTime.now().setZone('America/Sao_Paulo')
      const todayStart = now.startOf('day').toSeconds()
      const todayEnd = now.endOf('day').toSeconds()

      const newPosts = posts.filter(post => {
        if (importedIds.includes(post.id)) return false
        const postTime = post.takenAtTimestamp
        return postTime >= todayStart && postTime <= todayEnd
      })

      if (newPosts.length === 0) {
        return response.json({
          success: true,
          imported: 0,
          errors: 0,
          message: 'Nenhum post novo de hoje encontrado'
        })
      }

      // Limitar quantidade
      const limit = parseInt(await InstagramSetting.get('auto_import_limit', '5') || '5')
      const postsToImport = newPosts.slice(0, limit)

      // Processar cada post
      let imported = 0
      let errors = 0

      for (const post of postsToImport) {
        try {
          const ai = new AIProcessorService()
          const caption = post.caption || 'Publicação do Instagram'
          const generated = await ai.processCaption(caption)

          if (!generated.title) {
            errors++
            continue
          }

          const categoryId = await InstagramSetting.get('default_category')

          // Baixar imagem
          let coverImageUrl: string | null = null
          if (post.displayUrl) {
            try {
              coverImageUrl = await this.downloadAndSaveImage(post.displayUrl)
            } catch {}
          }

          const news = await News.create({
            title: generated.title,
            content: generated.content,
            excerpt: generated.content.substring(0, 200),
            slug: this.generateSlug(generated.title),
            status: 'published',
            categoryId: categoryId ? parseInt(categoryId) : null,
            authorId: auth.user?.id || 1,
            coverImageUrl,
            publishedAt: DateTime.fromSeconds(post.takenAtTimestamp)
          })

          await InstagramImportLog.create({
            instagramId: post.id,
            instagramShortcode: post.shortcode,
            instagramUrl: `https://instagram.com/p/${post.shortcode}`,
            instagramCaption: post.caption,
            instagramImageUrl: post.displayUrl,
            instagramPostDate: DateTime.fromSeconds(post.takenAtTimestamp),
            generatedTitle: generated.title,
            generatedContent: generated.content,
            aiProvider: await InstagramSetting.get('ai_provider'),
            aiModel: await InstagramSetting.get('ai_model'),
            aiTokensUsed: generated.tokensUsed,
            newsId: news.id,
            status: 'published',
            categoryId: categoryId ? parseInt(categoryId) : null,
            importedBy: auth.user?.id || null
          })

          imported++

          // Delay entre posts
          await new Promise(resolve => setTimeout(resolve, 2000))

        } catch (error) {
          console.error('Erro ao importar post:', error)
          errors++
        }
      }

      return response.json({
        success: true,
        imported,
        errors,
        message: imported > 0
          ? `${imported} post(s) importado(s) com sucesso!`
          : 'Nenhum post importado'
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
      const ai = new AIProcessorService()
      const result = await ai.testConnection()

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

  /**
   * Helpers
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100)
  }

  private async downloadAndSaveImage(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.ok) return null

      const buffer = await response.arrayBuffer()
      const filename = `instagram-${Date.now()}.jpg`
      const uploadDir = path.join(process.cwd(), 'public/uploads/instagram')

      // Criar diretório se não existir
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const filePath = path.join(uploadDir, filename)
      fs.writeFileSync(filePath, Buffer.from(buffer))

      return `/uploads/instagram/${filename}`
    } catch (error) {
      console.error('Erro ao baixar imagem:', error)
      return null
    }
  }
}
