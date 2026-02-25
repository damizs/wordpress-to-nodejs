import { DateTime } from 'luxon'
import InstagramImportSetting from '#models/instagram_import_setting'
import InstagramImportLog from '#models/instagram_import_log'
import News from '#models/news'
import InstagramScraperService, { type InstagramPost } from './instagram_scraper_service.js'
import AIProcessorService from './ai_processor_service.js'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs'
import path from 'node:path'

export default class InstagramAutoImporterService {
  private scraper: InstagramScraperService
  private aiProcessor: AIProcessorService

  constructor() {
    this.scraper = new InstagramScraperService()
    this.aiProcessor = new AIProcessorService()
  }

  /**
   * Executa importação automática
   */
  async runAutoImport(): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = []
    let importedCount = 0

    console.log(`[Auto Import] Iniciando às ${DateTime.now().toFormat('dd/MM/yyyy HH:mm:ss')}`)

    // Verificar se está habilitado
    const enabled = await InstagramImportSetting.get('auto_import_enabled')
    if (enabled !== 'true' && enabled !== '1') {
      console.log('[Auto Import] Desabilitado')
      return { imported: 0, errors: ['Importação automática desabilitada'] }
    }

    // Obter URL do perfil
    const profileUrl = await InstagramImportSetting.get('instagram_profile_url')
    if (!profileUrl) {
      console.log('[Auto Import] URL do perfil não configurada')
      return { imported: 0, errors: ['URL do perfil não configurada'] }
    }

    try {
      // Buscar posts
      const posts = await this.scraper.getPostsFromProfile(profileUrl)

      if (posts.length === 0) {
        console.log('[Auto Import] Nenhum post encontrado')
        return { imported: 0, errors: [this.scraper.getLastError() || 'Nenhum post encontrado'] }
      }

      console.log(`[Auto Import] ${posts.length} posts encontrados`)

      // Obter IDs já importados
      const importedIds = await InstagramImportLog.getImportedIds()

      // Filtrar posts de hoje não importados
      const todayStart = DateTime.now().setZone('America/Sao_Paulo').startOf('day').toSeconds()
      const todayEnd = DateTime.now().setZone('America/Sao_Paulo').endOf('day').toSeconds()

      const newPosts = posts.filter(post => {
        if (importedIds.includes(post.id)) return false
        if (post.takenAtTimestamp < todayStart || post.takenAtTimestamp > todayEnd) return false
        return true
      })

      console.log(`[Auto Import] ${newPosts.length} posts novos de hoje`)

      if (newPosts.length === 0) {
        return { imported: 0, errors: [] }
      }

      // Limitar quantidade
      const limitStr = await InstagramImportSetting.get('auto_import_limit')
      const limit = parseInt(limitStr || '5', 10)
      const postsToImport = newPosts.slice(0, limit)

      // Processar cada post
      for (const post of postsToImport) {
        try {
          const result = await this.importSinglePost(post)
          if (result) {
            importedCount++
          }
          // Pausa entre importações
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (error: any) {
          errors.push(`Post ${post.id}: ${error.message}`)
        }
      }

      console.log(`[Auto Import] ${importedCount} post(s) importado(s)`)
      return { imported: importedCount, errors }

    } catch (error: any) {
      console.error(`[Auto Import] Erro: ${error.message}`)
      return { imported: 0, errors: [error.message] }
    }
  }

  /**
   * Importa um único post
   */
  async importSinglePost(post: InstagramPost, userId?: number): Promise<News | null> {
    const startTime = Date.now()

    try {
      // Gerar conteúdo com IA
      const caption = post.caption || 'Publicação do Instagram'
      const generated = await this.aiProcessor.processCaption(caption)

      if (!generated.title) {
        throw new Error('IA não gerou título')
      }

      // Obter configurações
      const categoryIdStr = await InstagramImportSetting.get('default_category')
      const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : null
      const defaultStatusSetting = await InstagramImportSetting.get('default_status') || 'published'
      const defaultStatus: 'draft' | 'published' | 'archived' = 
        defaultStatusSetting === 'draft' ? 'draft' : 
        defaultStatusSetting === 'archived' ? 'archived' : 'published'

      // Baixar imagem
      let imagePath: string | null = null
      if (post.displayUrl) {
        try {
          imagePath = await this.downloadImage(post.displayUrl)
        } catch (imgError: any) {
          console.error(`[Auto Import] Erro ao baixar imagem: ${imgError.message}`)
        }
      }

      // Criar notícia
      const news = await News.create({
        title: generated.title,
        slug: this.generateSlug(generated.title),
        content: generated.content,
        excerpt: caption.substring(0, 200),
        status: defaultStatus,
        categoryId: categoryId,
        coverImageUrl: imagePath,
        publishedAt: DateTime.fromSeconds(post.takenAtTimestamp),
      })

      const processingTime = (Date.now() - startTime) / 1000

      // Salvar log
      await InstagramImportLog.create({
        instagramId: post.id,
        instagramShortcode: post.shortcode,
        instagramUrl: post.shortcode ? `https://instagram.com/p/${post.shortcode}` : null,
        instagramCaption: post.caption,
        instagramImageUrl: post.displayUrl,
        instagramPostDate: DateTime.fromSeconds(post.takenAtTimestamp),
        generatedTitle: generated.title,
        generatedContent: generated.content,
        aiProvider: await InstagramImportSetting.get('ai_provider'),
        aiModel: await InstagramImportSetting.get('ai_model'),
        aiTokensUsed: generated.tokensUsed,
        newsId: news.id,
        status: 'published',
        categoryId: categoryId,
        processingTime: processingTime,
        importedBy: userId || null,
      })

      console.log(`[Auto Import] Notícia criada: ${news.id} - ${news.title}`)
      return news

    } catch (error: any) {
      const processingTime = (Date.now() - startTime) / 1000

      // Salvar log de erro
      await InstagramImportLog.create({
        instagramId: post.id,
        instagramShortcode: post.shortcode,
        instagramUrl: post.shortcode ? `https://instagram.com/p/${post.shortcode}` : null,
        instagramCaption: post.caption,
        instagramImageUrl: post.displayUrl,
        instagramPostDate: DateTime.fromSeconds(post.takenAtTimestamp),
        status: 'error',
        processingTime: processingTime,
        errorMessage: error.message,
        importedBy: userId || null,
      })

      console.error(`[Auto Import] Erro ao importar post ${post.id}: ${error.message}`)
      return null
    }
  }

  /**
   * Baixa imagem do Instagram
   */
  private async downloadImage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const fileName = `instagram_${cuid()}.jpg`
    const uploadPath = app.makePath('public/uploads/news')

    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    const filePath = path.join(uploadPath, fileName)
    fs.writeFileSync(filePath, Buffer.from(buffer))

    return `/uploads/news/${fileName}`
  }

  /**
   * Gera slug único
   */
  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 80)

    return `${base}-${cuid().substring(0, 6)}`
  }

  /**
   * Busca posts do Instagram (para visualização no admin)
   */
  async fetchPosts(): Promise<InstagramPost[]> {
    const profileUrl = await InstagramImportSetting.get('instagram_profile_url')
    if (!profileUrl) {
      throw new Error('URL do perfil não configurada')
    }

    return this.scraper.getPostsFromProfile(profileUrl)
  }

  /**
   * Testa conexão com IA
   */
  async testAIConnection(): Promise<{ success: boolean; error?: string }> {
    return this.aiProcessor.testConnection()
  }
}
