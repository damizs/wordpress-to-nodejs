import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { Calendar, Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface NewsItem {
  id: number
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
  category?: { id: number; name: string; slug: string } | null
}

interface Props {
  news: {
    data: NewsItem[]
    meta: {
      total: number
      current_page: number
      last_page: number
    }
  }
  categories: Array<{ id: number; name: string; slug: string }>
  filters: { category: string; search: string }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function NewsIndex({ news, categories, filters }: Props) {
  const [search, setSearch] = useState(filters.search)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.get('/noticias', { busca: search, categoria: filters.category }, { preserveState: true })
  }

  function handleCategoryFilter(slug: string) {
    router.get('/noticias', { categoria: slug, busca: filters.search }, { preserveState: true })
  }

  return (
    <PublicLayout>
      <Head title="Notícias - Câmara Municipal de Sumé" />

      {/* Hero Banner */}
      <section className="relative py-16 px-4 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="relative container mx-auto text-center">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-3">Notícias</h1>
          <p className="text-white/60 max-w-lg mx-auto">
            Acompanhe as últimas notícias e atividades da Câmara Municipal de Sumé
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-8 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar notícias..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-white/40 text-sm focus:ring-2 focus:ring-gold/30 focus:border-gold/50 outline-none"
              />
            </div>
          </form>

          {/* Category pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !filters.category
                  ? 'bg-gold text-navy-dark'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filters.category === cat.slug
                    ? 'bg-gold text-navy-dark'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {news.data.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">Nenhuma notícia encontrada</p>
              {(filters.search || filters.category) && (
                <Link href="/noticias" className="text-navy text-sm mt-2 inline-block hover:underline">
                  Limpar filtros
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.data.map((item) => (
                <Link
                  key={item.id}
                  href={`/noticias/${item.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.cover_image_url || `https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=600&h=400&fit=crop`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.category && (
                      <span className="absolute top-3 left-3 bg-navy/90 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                        {item.category.name}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(item.published_at)}</span>
                    </div>
                    <h2 className="text-base font-serif font-bold text-gray-800 group-hover:text-navy transition-colors line-clamp-2 leading-snug mb-2">
                      {item.title}
                    </h2>
                    {item.excerpt && (
                      <p className="text-sm text-gray-500 line-clamp-2">{item.excerpt}</p>
                    )}
                    <div className="flex items-center gap-1 text-navy text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                      Ler mais <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {news.meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              {news.meta.current_page > 1 && (
                <Link
                  href={`/noticias?page=${news.meta.current_page - 1}&categoria=${filters.category}&busca=${filters.search}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </Link>
              )}
              <span className="text-sm text-gray-400">
                Página {news.meta.current_page} de {news.meta.last_page}
              </span>
              {news.meta.current_page < news.meta.last_page && (
                <Link
                  href={`/noticias?page=${news.meta.current_page + 1}&categoria=${filters.category}&busca=${filters.search}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Próxima <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
