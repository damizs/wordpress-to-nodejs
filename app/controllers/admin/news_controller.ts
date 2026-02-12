import type { HttpContext } from '@adonisjs/core/http'
import News from '#models/news'
import NewsCategory from '#models/news_category'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import string from '@adonisjs/core/helpers/string'

export default class NewsController {
  /** List all news with pagination */
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')
    const category = request.input('category', '')
    const search = request.input('search', '')

    let query = News.query().preload('category').preload('author').orderBy('created_at', 'desc')

    if (status) query = query.where('status', status)
    if (category) query = query.where('category_id', category)
    if (search) query = query.where((q) => {
      q.whereILike('title', `%${search}%`).orWhereILike('excerpt', `%${search}%`)
    })

    const news = await query.paginate(page, 15)
    const categories = await NewsCategory.query().orderBy('name', 'asc')

    return inertia.render('admin/news/index', {
      news: news.serialize(),
      categories: categories.map((c) => c.serialize()),
      filters: { status, category, search },
    })
  }

  /** Show create form */
  async create({ inertia }: HttpContext) {
    const categories = await NewsCategory.query().orderBy('name', 'asc')
    return inertia.render('admin/news/form', {
      news: null,
      categories: categories.map((c) => c.serialize()),
    })
  }

  /** Store new news */
  async store({ request, response, auth, session }: HttpContext) {
    const data = request.only(['title', 'excerpt', 'content', 'status', 'category_id'])

    // Generate slug
    let slug = string.slug(data.title, { lower: true })
    const existing = await News.findBy('slug', slug)
    if (existing) slug = `${slug}-${cuid().slice(0, 6)}`

    const news = await News.create({
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content || '',
      status: data.status || 'draft',
      categoryId: data.category_id || null,
      authorId: auth.user!.id,
      publishedAt: data.status === 'published' ? new Date() as any : null,
      viewsCount: 0,
    })

    // Handle cover image
    const cover = request.file('cover_image', { size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })
    if (cover) {
      const uploadDir = join(app.publicPath(), 'uploads', 'news')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `${news.slug}-${cuid().slice(0, 6)}.${cover.extname}`
      await cover.move(uploadDir, { name: fileName })
      news.coverImageUrl = `/uploads/news/${fileName}`
      await news.save()
    }

    session.flash('success', 'Notícia criada com sucesso!')
    return response.redirect('/painel/noticias')
  }

  /** Show edit form */
  async edit({ inertia, params }: HttpContext) {
    const news = await News.findOrFail(params.id)
    const categories = await NewsCategory.query().orderBy('name', 'asc')
    return inertia.render('admin/news/form', {
      news: news.serialize(),
      categories: categories.map((c) => c.serialize()),
    })
  }

  /** Update existing news */
  async update({ request, response, params, session }: HttpContext) {
    const news = await News.findOrFail(params.id)
    const data = request.only(['title', 'excerpt', 'content', 'status', 'category_id'])

    news.title = data.title
    news.excerpt = data.excerpt || null
    news.content = data.content || ''
    news.status = data.status || 'draft'
    news.categoryId = data.category_id || null

    // Set publishedAt if publishing for first time
    if (data.status === 'published' && !news.publishedAt) {
      news.publishedAt = new Date() as any
    }

    // Handle cover image
    const cover = request.file('cover_image', { size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] })
    if (cover) {
      const uploadDir = join(app.publicPath(), 'uploads', 'news')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `${news.slug}-${cuid().slice(0, 6)}.${cover.extname}`
      await cover.move(uploadDir, { name: fileName })
      news.coverImageUrl = `/uploads/news/${fileName}`
    }

    await news.save()
    session.flash('success', 'Notícia atualizada com sucesso!')
    return response.redirect('/painel/noticias')
  }

  /** Delete news */
  async destroy({ params, response, session }: HttpContext) {
    const news = await News.findOrFail(params.id)
    await news.delete()
    session.flash('success', 'Notícia excluída com sucesso!')
    return response.redirect('/painel/noticias')
  }
}
