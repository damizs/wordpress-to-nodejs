import type { HttpContext } from '@adonisjs/core/http'
import News from '#models/news'
import NewsCategory from '#models/news_category'
import SiteSetting from '#models/site_setting'

export default class PublicNewsController {
  /** List published news with pagination and filters */
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const category = request.input('categoria', '')
    const year = request.input('ano', '')
    const search = request.input('busca', '')

    // GetPublic (avisos de dispensa/licitação/extratos de contrato/diário) é
    // importado como categoria própria e NÃO deve aparecer no feed de Notícias.
    // Fica acessível só quando o usuário filtra explicitamente por essa categoria.
    const getpublicCat = await NewsCategory.findBy('slug', 'getpublic')

    let query = News.query()
      .where('status', 'published')
      .preload('category')
      .orderBy('published_at', 'desc')

    if (category) {
      query = query.where('category_id', category)
    } else if (getpublicCat) {
      query = query.whereNot('category_id', getpublicCat.id)
    }
    if (year) {
      const y = Number(year)
      query = query
        .where('published_at', '>=', `${y}-01-01`)
        .where('published_at', '<', `${y + 1}-01-01`)
    }
    if (search) {
      query = query.where((q) => {
        q.whereILike('title', `%${search}%`).orWhereILike('excerpt', `%${search}%`)
      })
    }

    const news = await query
      .select(
        'id',
        'title',
        'slug',
        'excerpt',
        'cover_image_url',
        'status',
        'published_at',
        'category_id',
        'views_count'
      )
      .paginate(page, 12)
    const categories = await NewsCategory.query().orderBy('name', 'asc')
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/news/index', {
      news: news.serialize(),
      categories: categories.map((c) => c.serialize()),
      filters: { category, year, search },
      siteSettings,
    })
  }

  /** Show single news article */
  async show({ inertia, params, response }: HttpContext) {
    const news = await News.query()
      .where('slug', params.slug)
      .where('status', 'published')
      .preload('category')
      .preload('author')
      .first()

    if (!news) {
      // URLs antigas de categoria do WP (/noticias/gestao-2023-2024/) → listagem
      const category = await NewsCategory.findBy('slug', params.slug)
      if (category) {
        return response.redirect().status(301).toPath(`/noticias?categoria=${category.id}`)
      }
      return response.redirect().status(301).toPath('/noticias')
    }

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
