import { DateTime } from 'luxon'
import InstagramSettings from '#models/instagram_settings'
import InstagramImport from '#models/instagram_import'
import News from '#models/news'
import InstagramScraperService, { type InstagramPost } from './instagram_scraper_service.js'
import AIProcessorService from './ai_processor_service.js'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import fs from 'node:fs'
import path from 'node:path'

export interface ImportResult {
  success: boolean
  imported: number
  errors: string[]
  posts: Array<{
    instagramId: string
    title: string
    newsId?: number
    error?: string
  }>
}

export default class InstagramImportService {
  private scraper: InstagramScraperService
  private aiProcessor: AIProcessorService
  private settings: InstagramSettings | null = null

  constructor() {
    this.scraper = new InstagramScraperService()
    this.aiProcessor = new AIProcessorService()
  }

  /**
   * Busca posts do Instagram para preview (não importa)
   */
  async fetchPosts(): Promise<{ posts: InstagramPost[]; error?: string }> {
    this.settings = await InstagramSettings.getSettings()

    if (!this.settings.instagramProfileUrl) {
      return { posts: [], error: 'URL do perfil não configurada' }
    }

    try {
      const posts = await this.scraper.getPostsFromProfile(this.settings.instagramProfileUrl)
      return { posts }
    } catch (error: any) {
      return { posts: [], error: error.message }
    }
  }

  /**
   * Importa posts do Instagram como notícias
   */
  async importPosts(options: {
    limit?: number
    onlyToday?: boolean
    isAutoImport?: boolean
    userId?: number
  } = {}): Promise<ImportResult> {
    const startTime = Date.now()
    this.settings = await InstagramSettings.getSettings()

    const result: ImportResult = {
      success: false,
      imported: 0,
      errors: [],
      posts: [],
    }

    // Validações
    if (!this.settings.instagramProfileUrl) {
      result.errors.push('URL do perfil não configurada')
      return result
    }

    if (!this.settings.aiApiKey) {
      result.errors.push('API Key da IA não configurada')
      return result
    }

    try {
      // 1. Buscar posts do Instagram
      const posts = await this.scraper.getPostsFromProfile(this.settings.instagramProfileUrl)

      if (posts.length === 0) {
        result.errors.push('Nenhum post encontrado: ' + this.scraper.getLastError())
        return result
      }

      // 2. Filtrar posts já importados
      const importedIds = await this.getImportedInstagramIds()
      let newPosts = posts.filter((post) => !importedIds.includes(post.id))

      // 3. Filtrar apenas posts de hoje (se configurado)
      const onlyToday = options.onlyToday ?? this.settings.importOnlyToday
      if (onlyToday) {
        const todayStart = DateTime.now().startOf('day').toSeconds()
        const todayEnd = DateTime.now().endOf('day').toSeconds()

        newPosts = newPosts.filter((post) => {
          return post.takenAtTimestamp >= todayStart && post.takenAtTimestamp <= todayEnd
        })
      }

      if (newPosts.length === 0) {
        result.success = true
        result.errors.push('Nenhum post novo para importar')
        return result
      }

      // 4. Limitar quantidade
      const limit = options.limit ?? this.settings.autoImportLimit
      newPosts = newPosts.slice(0, limit)

      // 5. Processar cada post
      for (const post of newPosts) {
        try {
          const importResult = await this.importSinglePost(post, {
            isAutoImport: options.isAutoImport ?? false,
            userId: options.userId,
            startTime,
          })

          result.posts.push({
            instagramId: post.id,
            title: importResult.title,
            newsId: importResult.newsId,
          })
          result.imported++
        } catch (error: any) {
          result.posts.push({
            instagramId: post.id,
            title: '',
            error: error.message,
          })
          result.errors.push(`Post ${post.id}: ${error.message}`)
        }

        // Pequena pausa entre posts
        if (newPosts.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }

      result.success = result.imported > 0

      // Atualizar last import info
      this.settings.lastImportAt = DateTime.now()
      this.settings.lastImportCount = result.imported
      this.settings.lastImportError = result.errors.length > 0 ? result.errors.join('; ') : null
      await this.settings.save()

    } catch (error: any) {
      result.errors.push(error.message)
    }

    return result
  }

  /**
   * Importa um único post
   */
  private async importSinglePost(
    post: InstagramPost,
    options: { isAutoImport: boolean; userId?: number; startTime: number }
  ): Promise<{ title: string; newsId: number }> {
    const caption = post.caption || 'Post do Instagram sem legenda'

    // 1. Gerar conteúdo com IA
    const generated = await this.aiProcessor.processCaption(caption)

    if (!generated.title) {
      throw new Error('IA não gerou título')
    }

    // 2. Baixar imagem (se configurado)
    let imagePath: string | null = null
    if (this.settings!.downloadImages && post.displayUrl) {
      try {
        imagePath = await this.downloadImage(post.displayUrl)
      } catch (error) {
        console.error('[InstagramImport] Erro ao baixar imagem:', error)
      }
    }

    // 3. Criar notícia
    const news = await News.create({
      title: generated.title,
      content: generated.content,
      excerpt: caption.substring(0, 200),
      slug: this.generateSlug(generated.title),
      status: this.settings!.defaultStatus,
      categoryId: this.settings!.defaultCategoryId,
      coverImageUrl: imagePath,
      publishedAt: DateTime.fromSeconds(post.takenAtTimestamp),
    })

    // 4. Salvar log de importação
    const processingTime = (Date.now() - options.startTime) / 1000

    await InstagramImport.create({
      instagramId: post.id,
      instagramUrl: `https://instagram.com/p/${post.shortcode}`,
      instagramCaption: caption,
      instagramImageUrl: post.displayUrl,
      instagramPostDate: DateTime.fromSeconds(post.takenAtTimestamp),
      generatedTitle: generated.title,
      generatedContent: generated.content,
      aiProvider: this.settings!.aiProvider,
      aiModel: this.settings!.aiModel,
      aiTokensUsed: generated.tokensUsed,
      newsId: news.id,
      newsStatus: this.settings!.defaultStatus,
      categoryId: this.settings!.defaultCategoryId,
      importedAt: DateTime.now(),
      importedBy: options.userId,
      processingTime,
      isAutoImport: options.isAutoImport,
    })

    return { title: generated.title, newsId: news.id }
  }

  /**
   * Retorna IDs do Instagram já importados
   */
  private async getImportedInstagramIds(): Promise<string[]> {
    const imports = await InstagramImport.query()
      .whereNotNull('newsId')
      .select('instagramId')

    return imports.map((i) => i.instagramId)
  }

  /**
   * Baixa imagem e salva localmente
   */
  private async downloadImage(url: string): Promise<string> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Erro ao baixar imagem: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const ext = url.includes('.png') ? 'png' : 'jpg'
    const filename = `instagram_${cuid()}.${ext}`
    const uploadPath = app.makePath('public/uploads/news')

    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    const filepath = path.join(uploadPath, filename)
    fs.writeFileSync(filepath, Buffer.from(buffer))

    return `/uploads/news/${filename}`
  }

  /**
   * Gera slug a partir do título
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

  /**
   * Retorna histórico de importações
   */
  async getImportHistory(options: { limit?: number; onlyErrors?: boolean } = {}) {
    const query = InstagramImport.query()
      .orderBy('importedAt', 'desc')
      .limit(options.limit || 50)

    if (options.onlyErrors) {
      query.whereNotNull('errorMessage')
    }

    return query
  }
}
