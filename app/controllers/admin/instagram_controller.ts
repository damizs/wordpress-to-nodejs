import type { HttpContext } from '@adonisjs/core/http'
import InstagramSetting from '#models/instagram_setting'
import InstagramImport from '#models/instagram_import'
import News from '#models/news'
import NewsCategory from '#models/news_category'
import InstagramScraperService from '#services/instagram_scraper_service'
import AiProcessorService from '#services/ai_processor_service'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

export default class InstagramController {
  /**
   * Dashboard - Lista importações e configurações
   */
  async index({ inertia }: HttpContext) {
    const settings = await InstagramSetting.query().first() || new InstagramSetting()
    const imports = await InstagramImport.query()
      .preload('news')
      .orderBy('createdAt', 'desc')
      .limit(20)
    
    const categories = await NewsCategory.query().orderBy('name', 'asc')

    // Estatísticas
    const stats = {
      total: await InstagramImport.query().count('* as total'),
      published: await InstagramImport.query().where('importStatus', 'published').count('* as total'),
      failed: await InstagramImport.query().where('importStatus', 'failed').count('* as total'),
      today: await InstagramImport.query()
        .whereRaw('DATE(created_at) = CURRENT_DATE')
        .count('* as total')
    }

    return inertia.render('admin/instagram/index', {
      settings: settings.toJSON(),
      imports: imports.map(i => i.toJSON()),
      categories: categories.map(c => c.toJSON()),
      stats: {
        total: Number(stats.total[0].$extras.total),
        published: Number(stats.published[0].$extras.total),
        failed: Number(stats.failed[0].$extras.total),
        today: Number(stats.today[0].$extras.total)
      }
    })
  }

  /**
   * Página de configurações
   */
  async settings({ inertia }: HttpContext) {
    const settings = await InstagramSetting.query().first() || new InstagramSetting()
    const categories = await NewsCategory.query().orderBy('name', 'asc')

    return inertia.render('admin/instagram/settings', {
      settings: settings.toJSON(),
      categories: categories.map(c => c.toJSON()),
      defaultPrompt: AiProcessorService.DEFAULT_PROMPT
    })
  }

  /**
   * Salva configurações
   */
  async saveSettings({ request, response, session }: HttpContext) {
    let settings = await InstagramSetting.query().first()
    
    if (!settings) {
      settings = new InstagramSetting()
    }

    // Configurações do Instagram
    settings.instagramProfileUrl = request.input('instagram_profile_url')
    settings.rapidapiKey = request.input('rapidapi_key')
    settings.instagramSessionid = request.input('instagram_sessionid')
    settings.instagramUseragent = request.input('instagram_useragent')

    // Configurações de IA
    settings.aiProvider = request.input('ai_provider', 'gemini')
    settings.aiApiKey = request.input('ai_api_key')
    settings.aiModel = request.input('ai_model', 'gemini-2.0-flash')
    settings.aiPrompt = request.input('ai_prompt')

    // Configurações de importação
    settings.autoImportEnabled = request.input('auto_import_enabled') === 'on' || request.input('auto_import_enabled') === true
    settings.cronMode = request.input('cron_mode', 'daily')
    settings.cronHour = Number(request.input('cron_hour', 19))
    settings.cronMinute = Number(request.input('cron_minute', 0))
    settings.autoImportLimit = Number(request.input('auto_import_limit', 5))
    settings.defaultStatus = request.input('default_status', 'published')
    settings.defaultCategoryId = request.input('default_category_id') ? Number(request.input('default_category_id')) : null
    settings.downloadImages = request.input('download_images') === 'on' || request.input('download_images') === true
    settings.preventDuplicates = request.input('prevent_duplicates') === 'on' || request.input('prevent_duplicates') === true

    await settings.save()

    session.flash('success', 'Configurações salvas com sucesso!')
    return response.redirect().back()
  }

  /**
   * Busca posts do Instagram (AJAX)
   */
  async fetchPosts({ response }: HttpContext) {
    try {
      const settings = await InstagramSetting.query().first()
      
      if (!settings?.instagramProfileUrl) {
        return response.json({ success: false, message: 'URL do perfil não configurada' })
      }

      const scraper = new InstagramScraperService()
      const posts = await scraper.getPostsFromProfile(
        settings.instagramProfileUrl,
        settings.rapidapiKey || undefined
      )

      // Buscar IDs já importados
      const importedIds = await InstagramImport.query()
        .where('importStatus', 'published')
        .select('instagramId')
      
      const importedIdSet = new Set(importedIds.map(i => i.instagramId))

      // Marcar posts já importados
      const postsWithStatus = posts.map(post => ({
        ...post,
        alreadyImported: importedIdSet.has(post.id)
      }))

      return response.json({ 
        success: true, 
        posts: postsWithStatus,
        error: scraper.getLastError() || null
      })
    } catch (error: any) {
      return response.json({ success: false, message: error.message })
    }
  }

  /**
   * Processa legenda com IA (AJAX)
   */
  async processCaption({ request, response }: HttpContext) {
    try {
      const settings = await InstagramSetting.query().first()
      
      if (!settings?.aiApiKey) {
        return response.json({ success: false, message: 'API Key da IA não configurada' })
      }

      const caption = request.input('caption', '')
      
      const ai = new AiProcessorService({
        provider: settings.aiProvider as any,
        apiKey: settings.aiApiKey,
        model: settings.aiModel,
        prompt: settings.aiPrompt || undefined
      })

      const result = await ai.processCaption(caption)

      return response.json({ 
        success: true, 
        title: result.title,
        content: result.content,
        tokensUsed: result.tokensUsed
      })
    } catch (error: any) {
      return response.json({ success: false, message: error.message })
    }
  }

  /**
   * Testa conexão com a IA (AJAX)
   */
  async testAiConnection({ response }: HttpContext) {
    try {
      const settings = await InstagramSetting.query().first()
      
      if (!settings?.aiApiKey) {
        return response.json({ success: false, message: 'API Key não configurada' })
      }

      const ai = new AiProcessorService({
        provider: settings.aiProvider as any,
        apiKey: settings.aiApiKey,
        model: settings.aiModel
      })

      const result = await ai.testConnection()
      
      if (result === true) {
        return response.json({ success: true, message: 'Conexão com IA funcionando!' })
      } else {
        return response.json({ success: false, message: result })
      }
    } catch (error: any) {
      return response.json({ success: false, message: error.message })
    }
  }

  /**
   * Publica um post (AJAX)
   */
  async publishPost({ request, response, auth }: HttpContext) {
    try {
      const settings = await InstagramSetting.query().first()
      
      const instagramId = request.input('instagram_id')
      const instagramUrl = request.input('instagram_url')
      const instagramCaption = request.input('caption')
      const instagramImageUrl = request.input('image_url')
      const instagramTimestamp = request.input('timestamp')
      const generatedTitle = request.input('title')
      const generatedContent = request.input('content')

      // Verificar duplicata
      if (settings?.preventDuplicates) {
        const existing = await InstagramImport.query().where('instagramId', instagramId).first()
        if (existing) {
          return response.json({ success: false, message: 'Este post já foi importado' })
        }
      }

      // Criar notícia
      const news = new News()
      news.title = generatedTitle
      news.content = generatedContent
      news.excerpt = generatedContent.substring(0, 200) + '...'
      news.slug = this.generateSlug(generatedTitle)
      news.status = (settings?.defaultStatus || 'published') as 'draft' | 'published' | 'archived'
      news.categoryId = settings?.defaultCategoryId || null
      news.publishedAt = instagramTimestamp 
        ? DateTime.fromSeconds(Number(instagramTimestamp))
        : DateTime.now()

      // Baixar imagem se configurado
      if (settings?.downloadImages && instagramImageUrl) {
        try {
          const imagePath = await this.downloadImage(instagramImageUrl, news.slug)
          news.coverImageUrl = imagePath
        } catch (error) {
          console.error('[Instagram] Erro ao baixar imagem:', error)
        }
      }

      await news.save()

      // Salvar log de importação
      const importLog = new InstagramImport()
      importLog.instagramId = instagramId
      importLog.instagramUrl = instagramUrl || `https://instagram.com/p/${instagramId}`
      importLog.instagramCaption = instagramCaption
      importLog.instagramImageUrl = instagramImageUrl
      importLog.instagramPostDate = instagramTimestamp 
        ? DateTime.fromSeconds(Number(instagramTimestamp))
        : null
      importLog.generatedTitle = generatedTitle
      importLog.generatedContent = generatedContent
      importLog.aiProvider = settings?.aiProvider || 'gemini'
      importLog.aiModel = settings?.aiModel || 'gemini-2.0-flash'
      importLog.newsId = news.id
      importLog.importStatus = 'published'
      importLog.importedBy = auth.user?.id || null

      await importLog.save()

      return response.json({ 
        success: true, 
        message: 'Notícia publicada com sucesso!',
        newsId: news.id
      })
    } catch (error: any) {
      console.error('[Instagram] Erro ao publicar:', error)
      return response.json({ success: false, message: error.message })
    }
  }

  /**
   * Executa importação automática (AJAX)
   */
  async runAutoImport({ response, auth }: HttpContext) {
    try {
      const settings = await InstagramSetting.query().first()
      
      if (!settings?.instagramProfileUrl || !settings?.aiApiKey) {
        return response.json({ 
          success: false, 
          message: 'Configure URL do perfil e API Key da IA primeiro' 
        })
      }

      // Buscar posts
      const scraper = new InstagramScraperService()
      const posts = await scraper.getPostsFromProfile(
        settings.instagramProfileUrl,
        settings.rapidapiKey || undefined
      )

      if (posts.length === 0) {
        return response.json({ 
          success: false, 
          message: 'Nenhum post encontrado',
          debug: { error: scraper.getLastError() }
        })
      }

      // Buscar IDs já importados
      const importedIds = await InstagramImport.query()
        .where('importStatus', 'published')
        .select('instagramId')
      
      const importedIdSet = new Set(importedIds.map(i => i.instagramId))

      // Filtrar posts de hoje não importados
      const todayStart = DateTime.now().startOf('day').toSeconds()
      const todayEnd = DateTime.now().endOf('day').toSeconds()

      const newPosts = posts.filter(post => {
        if (importedIdSet.has(post.id)) return false
        if (post.takenAtTimestamp < todayStart || post.takenAtTimestamp > todayEnd) return false
        return true
      }).slice(0, settings.autoImportLimit)

      if (newPosts.length === 0) {
        return response.json({ 
          success: true, 
          message: 'Nenhum post novo de hoje para importar',
          imported: 0
        })
      }

      // Processar cada post
      const ai = new AiProcessorService({
        provider: settings.aiProvider as any,
        apiKey: settings.aiApiKey,
        model: settings.aiModel,
        prompt: settings.aiPrompt || undefined
      })

      let importedCount = 0
      const errors: string[] = []

      for (const post of newPosts) {
        try {
          // Gerar conteúdo
          const generated = await ai.processCaption(post.caption || 'Publicação do Instagram')

          if (!generated.title) {
            errors.push(`Post ${post.id}: IA não gerou título`)
            continue
          }

          // Criar notícia
          const news = new News()
          news.title = generated.title
          news.content = generated.content
          news.excerpt = generated.content.substring(0, 200) + '...'
          news.slug = this.generateSlug(generated.title)
          news.status = (settings.defaultStatus || 'published') as 'draft' | 'published' | 'archived'
          news.categoryId = settings.defaultCategoryId || null
          news.publishedAt = DateTime.fromSeconds(post.takenAtTimestamp)

          // Baixar imagem
          if (settings.downloadImages && post.displayUrl) {
            try {
              const imagePath = await this.downloadImage(post.displayUrl, news.slug)
              news.coverImageUrl = imagePath
            } catch (error) {
              console.error('[Instagram] Erro ao baixar imagem:', error)
            }
          }

          await news.save()

          // Salvar log
          const importLog = new InstagramImport()
          importLog.instagramId = post.id
          importLog.instagramUrl = `https://instagram.com/p/${post.shortcode || post.id}`
          importLog.instagramCaption = post.caption
          importLog.instagramImageUrl = post.displayUrl
          importLog.instagramPostDate = DateTime.fromSeconds(post.takenAtTimestamp)
          importLog.generatedTitle = generated.title
          importLog.generatedContent = generated.content
          importLog.aiProvider = settings.aiProvider
          importLog.aiModel = settings.aiModel
          importLog.aiTokensUsed = generated.tokensUsed
          importLog.newsId = news.id
          importLog.importStatus = 'published'
          importLog.importedBy = auth.user?.id || null

          await importLog.save()
          importedCount++

          // Pausa entre posts
          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error: any) {
          errors.push(`Post ${post.id}: ${error.message}`)
        }
      }

      return response.json({ 
        success: true, 
        message: `${importedCount} post(s) importado(s) com sucesso!`,
        imported: importedCount,
        errors: errors.length > 0 ? errors : undefined
      })
    } catch (error: any) {
      return response.json({ success: false, message: error.message })
    }
  }

  /**
   * Histórico de importações
   */
  async history({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')

    let query = InstagramImport.query()
      .preload('news')
      .orderBy('createdAt', 'desc')

    if (status) {
      query = query.where('importStatus', status)
    }

    const imports = await query.paginate(page, 20)

    return inertia.render('admin/instagram/history', {
      imports: imports.toJSON()
    })
  }

  /**
   * Deleta um log de importação
   */
  async deleteImport({ params, response, session }: HttpContext) {
    const importLog = await InstagramImport.find(params.id)
    
    if (importLog) {
      await importLog.delete()
      session.flash('success', 'Registro removido com sucesso!')
    }

    return response.redirect().back()
  }

  // Helpers
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100)
  }

  private async downloadImage(url: string, slug: string): Promise<string> {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Falha ao baixar imagem')

    const buffer = await response.arrayBuffer()
    const ext = url.includes('.png') ? 'png' : 'jpg'
    const filename = `${slug}-${Date.now()}.${ext}`
    
    const uploadDir = app.makePath('public/uploads/news')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, Buffer.from(buffer))

    return `/uploads/news/${filename}`
  }
}
