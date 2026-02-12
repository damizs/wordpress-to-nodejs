import type { HttpContext } from '@adonisjs/core/http'
import News from '#models/news'
import NewsCategory from '#models/news_category'
import SiteSetting from '#models/site_setting'

export default class PublicNewsController {
  /** List published news with pagination and filters */
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const category = request.input('categoria', '')
    const search = request.input('busca', '')

    let query = News.query()
      .where('status', 'published')
      .preload('category')
      .orderBy('published_at', 'desc')

    if (category) {
      query = query.whereHas('category', (q) => q.where('slug', category))
    }
    if (search) {
      query = query.where((q) => {
        q.whereILike('title', `%${search}%`).orWhereILike('excerpt', `%${search}%`)
      })
    }

    const news = await query.paginate(page, 12)
    const categories = await NewsCategory.query().orderBy('name', 'asc')
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/news/index', {
      news: news.serialize(),
      categories: categories.map((c) => c.serialize()),
      filters: { category, search },
      siteSettings,
    })
  }

  /** Show single news article */
  async show({ inertia, params }: HttpContext) {
    const news = await News.query()
      .where('slug', params.slug)
      .where('status', 'published')
      .preload('category')
      .preload('author')
      .firstOrFail()

    // Increment views
    news.viewsCount = (news.viewsCount || 0) + 1
    await news.save()

    // Related news (same category, excluding current)
    const related = news.categoryId
      ? await News.query()
          .where('status', 'published')
          .where('category_id', news.categoryId)
          .whereNot('id', news.id)
          .orderBy('published_at', 'desc')
          .limit(3)
          .preload('category')
      : []

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/news/show', {
      news: news.serialize(),
      related: related.map((r) => r.serialize()),
      siteSettings,
    })
  }
}
