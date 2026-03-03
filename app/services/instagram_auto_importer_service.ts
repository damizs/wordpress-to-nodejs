import { DateTime } from 'luxon'
import InstagramSetting from '#models/instagram_setting'
import InstagramImportLog from '#models/instagram_import_log'
import News from '#models/news'
import InstagramScraperService, { InstagramPost } from './instagram_scraper_service.js'
import AIProcessorService from './ai_processor_service.js'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'

export interface ImportResult {
  imported: number
  errors: number
  posts: Array<{
    instagramId: string
    title?: string
    newsId?: number
    error?: string
  }>
}

export default class InstagramAutoImporterService {
  private scraper: InstagramScraperService
  private aiProcessor: AIProcessorService

  constructor() {
    this.scraper = new InstagramScraperService()
    this.aiProcessor = new AIProcessorService()
  }

  /**
   * Fetch posts from Instagram
   */
  async fetchPosts(limit?: number): Promise<InstagramPost[]> {
    const profileUrl = await InstagramSetting.get('instagram_profile_url')
    if (!profileUrl) {
      throw new Error('URL do perfil do Instagram não configurada')
    }
    return this.scraper.getPostsFromProfile(profileUrl, limit)
  }

  /**
   * Run automatic import - imports only today's posts
   */
  async runAutoImport(): Promise<ImportResult> {
    console.log('Auto Import: Starting at', DateTime.now().setZone('America/Sao_Paulo').toFormat('dd/MM/yyyy HH:mm:ss'))

    const enabled = await InstagramSetting.get('auto_import_enabled')
    if (enabled !== 'true' && enabled !== '1') {
      console.log('Auto Import: Disabled')
      return { imported: 0, errors: 0, posts: [] }
    }

    const profileUrl = await InstagramSetting.get('instagram_profile_url')
    if (!profileUrl) {
      console.log('Auto Import: Profile URL not configured')
      return { imported: 0, errors: 0, posts: [] }
    }

    try {
      // Fetch posts
      const posts = await this.scraper.getPostsFromProfile(profileUrl)
      if (posts.length === 0) {
        console.log('Auto Import: No posts found')
        return { imported: 0, errors: 0, posts: [] }
      }

      console.log(`Auto Import: ${posts.length} posts found in profile`)

      // Get already imported IDs
      const importedIds = await InstagramImportLog.getImportedIds()

      // Filter only today's posts (Brasília timezone)
      const now = DateTime.now().setZone('America/Sao_Paulo')
      const todayStart = now.startOf('day').toSeconds()
      const todayEnd = now.endOf('day').toSeconds()

      console.log(`Auto Import: Filtering posts from ${now.toFormat('dd/MM/yyyy')}`)

      const newPosts = posts.filter(post => {
        // Skip if already imported
        if (importedIds.includes(post.id)) {
          return false
        }
        // Check if it's from today
        if (post.takenAtTimestamp < todayStart || post.takenAtTimestamp > todayEnd) {
          return false
        }
        return true
      })

      console.log(`Auto Import: ${newPosts.length} new posts from today`)

      if (newPosts.length === 0) {
        return { imported: 0, errors: 0, posts: [] }
      }

      // Limit posts per execution
      const limit = Number(await InstagramSetting.get('auto_import_limit', '5'))
      const postsToImport = newPosts.slice(0, limit)

      // Import each post
      const result: ImportResult = { imported: 0, errors: 0, posts: [] }

      for (const post of postsToImport) {
        try {
          const news = await this.importSinglePost(post)
          if (news) {
            result.imported++
            result.posts.push({
              instagramId: post.id,
              title: news.title,
              newsId: news.id,
            })
          }
        } catch (error: any) {
          result.errors++
          result.posts.push({
            instagramId: post.id,
            error: error.message,
          })
        }

        // Small delay between imports
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      console.log(`Auto Import: ${result.imported} post(s) imported, ${result.errors} error(s)`)
      return result

    } catch (error: any) {
      console.error('Auto Import Error:', error.message)
      throw error
    }
  }

  /**
   * Import a single post
   */
  async importSinglePost(post: InstagramPost, userId?: number, customTitle?: string, customContent?: string): Promise<News | null> {
    const startTime = Date.now()

    try {
      let title: string
      let content: string
      let tokensUsed = 0

      // Se título e conteúdo customizados foram fornecidos, usar diretamente
      if (customTitle && customContent) {
        title = customTitle
        content = customContent
      } else {
        // Gerar com IA
        const caption = post.caption || 'Publicação do Instagram'
        await this.aiProcessor.init()
        const generated = await this.aiProcessor.processCaption(caption)

        if (!generated?.title) {
          throw new Error('Falha ao gerar conteúdo')
        }
        
        title = generated.title
        content = generated.content
        tokensUsed = generated.tokensUsed
      }

      // Get settings
      const categoryId = Number(await InstagramSetting.get('default_category', '0')) || null
      const defaultStatus = await InstagramSetting.get('default_status', 'published')
      const status = defaultStatus as 'draft' | 'published'

      // Use original Instagram date
      let publishedAt: DateTime = DateTime.now()
      if (post.takenAtTimestamp) {
        const parsed = DateTime.fromSeconds(post.takenAtTimestamp)
        if (parsed.isValid) {
          publishedAt = parsed
        }
      }

      // Download image
      let coverImageUrl: string | null = null
      if (post.displayUrl) {
        try {
          coverImageUrl = await this.downloadImage(post.displayUrl)
        } catch (error: any) {
          console.error('Image download error:', error.message)
        }
      }

      // Create news
      const news = await News.create({
        title,
        content,
        excerpt: content.substring(0, 200) + '...',
        status,
        categoryId,
        coverImageUrl,
        authorId: userId || null,
        publishedAt,
        slug: this.generateSlug(title),
      })

      const processingTime = Date.now() - startTime

      // Save import log
      await InstagramImportLog.create({
        instagramId: post.id,
        instagramShortcode: post.shortcode,
        instagramUrl: `https://instagram.com/p/${post.shortcode}`,
        instagramCaption: post.caption,
        instagramImageUrl: post.displayUrl,
        instagramPostDate: DateTime.fromSeconds(post.takenAtTimestamp),
        generatedTitle: title,
        generatedContent: content,
        aiProvider: await InstagramSetting.get('ai_provider'),
        aiModel: await InstagramSetting.get('ai_model'),
        aiTokensUsed: tokensUsed,
        newsId: news.id,
        categoryId,
        importedBy: userId || null,
        status: status === 'published' ? 'published' : 'draft',
        processingTime,
      })

      console.log(`Imported: ${title} (ID: ${news.id})`)
      return news

    } catch (error: any) {
      const processingTime = Date.now() - startTime

      // Save error log
      await InstagramImportLog.create({
        instagramId: post.id,
        instagramShortcode: post.shortcode,
        instagramUrl: `https://instagram.com/p/${post.shortcode}`,
        instagramCaption: post.caption,
        instagramImageUrl: post.displayUrl,
        instagramPostDate: post.takenAtTimestamp ? DateTime.fromSeconds(post.takenAtTimestamp) : null,
        importedBy: userId || null,
        status: 'error',
        errorMessage: error.message,
        processingTime,
      })

      throw error
    }
  }

  /**
   * Download image from URL
   */
  private async downloadImage(url: string): Promise<string> {
    const uploadsDir = app.makePath('public/uploads/instagram')
    await mkdir(uploadsDir, { recursive: true })

    const ext = this.getImageExtension(url)
    const filename = `ig-${cuid()}.${ext}`
    const filepath = path.join(uploadsDir, filename)

    const response = await fetch(url)
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download image: ${response.status}`)
    }

    const writeStream = createWriteStream(filepath)
    // @ts-ignore - Node.js types issue
    await pipeline(response.body, writeStream)

    return `/uploads/instagram/${filename}`
  }

  /**
   * Get image extension from URL
   */
  private getImageExtension(url: string): string {
    try {
      const parsed = new URL(url)
      const pathname = parsed.pathname.toLowerCase()
      if (pathname.includes('.png')) return 'png'
      if (pathname.includes('.gif')) return 'gif'
      if (pathname.includes('.webp')) return 'webp'
    } catch {}
    return 'jpg'
  }

  /**
   * Generate slug from title
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
   * Test AI connection
   */
  async testAIConnection(): Promise<{ success: boolean; error?: string }> {
    return this.aiProcessor.testConnection()
  }
}
