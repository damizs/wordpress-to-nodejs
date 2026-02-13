import { Head, Link } from '@inertiajs/react'
import SeoHead from '~/components/SeoHead'
import PublicLayout from '~/layouts/PublicLayout'
import { Calendar, User, Eye, ChevronRight, ArrowRight, Share2, Tag } from 'lucide-react'

interface NewsItem {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  published_at: string | null
  views_count: number
  category?: { id: number; name: string; slug: string } | null
  author?: { full_name: string } | null
}

interface Props {
  news: NewsItem
  related: NewsItem[]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

export default function NewsShow({ news, related }: Props) {
  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: news.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado!')
    }
  }

  return (
    <PublicLayout>
      <SeoHead
        title={news.title}
        description={news.excerpt || news.title}
        image={news.cover_image_url}
        url={`/noticias/${news.slug}`}
        type="article"
        publishedAt={news.published_at}
      />

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3 border-b">
        <div className="max-w-4xl mx-auto px-4 text-sm text-gray-500 flex items-center gap-2">
          <a href="/" className="hover:text-navy">Início</a>
          <ChevronRight className="w-3 h-3" />
          <a href="/noticias" className="hover:text-navy">Notícias</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 line-clamp-1">{news.title}</span>
        </div>
      </div>

      {/* Hero with cover image */}
      <section className="relative h-72 lg:h-96 overflow-hidden">
        <img
          src={news.cover_image_url || `https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1200&h=600&fit=crop`}
          alt={news.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="container mx-auto max-w-4xl">
            {news.category && (
              <span className="inline-block bg-gold text-navy-dark text-xs font-semibold px-3 py-1 rounded-full mb-4">
                {news.category.name}
              </span>
            )}

            <h1 className="text-2xl lg:text-4xl font-serif font-bold text-white leading-tight">
              {news.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(news.published_at)}</span>
            </div>
            {news.author && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>{news.author.full_name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{news.views_count} visualizações</span>
            </div>
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-2 text-sm text-navy hover:text-navy-dark transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
          </div>

          {/* Excerpt */}
          {news.excerpt && (
            <p className="text-lg text-gray-600 font-medium leading-relaxed mb-8">
              {news.excerpt}
            </p>
          )}

          {/* Article content */}
          <article
            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-navy prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>
      </section>

      {/* Related News */}
      {related.length > 0 && (
        <section className="py-12 px-4 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-xl font-serif font-bold text-gray-800 mb-6">Notícias Relacionadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/noticias/${item.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all"
                >
                  <div className="h-32 overflow-hidden">
                    <img
                      src={item.cover_image_url || 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=250&fit=crop'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-gray-400">{formatDate(item.published_at)}</span>
                    <h3 className="text-sm font-medium text-gray-800 group-hover:text-navy line-clamp-2 mt-1 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  )
}
