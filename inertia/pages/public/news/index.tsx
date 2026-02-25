import { Link, router } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { Calendar, Search, ChevronLeft, ChevronRight, ArrowRight, Newspaper } from 'lucide-react'
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
    <>
      <SeoHead
        title="Notícias - Câmara Municipal de Sumé"
        description="Últimas notícias e atividades da Câmara Municipal de Sumé. Acompanhe sessões, projetos de lei e ações legislativas."
        url="/noticias"
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Notícias' }]} />
          
          {/* Hero com busca */}
          <section className="bg-gradient-hero py-8">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground tracking-wide mb-4">
                NOTÍCIAS
              </h1>
              <p className="text-primary-foreground/70 max-w-lg mx-auto mb-6">
                Acompanhe as últimas notícias e atividades da Câmara Municipal de Sumé
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar notícias..."
                    className="w-full pl-12 pr-4 py-3 bg-primary text-primary-foreground placeholder:text-primary-foreground/40 border border-primary-foreground/20 rounded-xl text-sm focus:ring-2 focus:ring-gold/30 outline-none"
                  />
                </div>
              </form>

              {/* Category pills */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleCategoryFilter('')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    !filters.category
                      ? 'bg-gold text-foreground'
                      : 'bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20'
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
                        ? 'bg-gold text-foreground'
                        : 'bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* News Grid */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              {news.data.length === 0 ? (
                <div className="card-modern p-12 text-center max-w-md mx-auto">
                  <Newspaper className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma notícia encontrada</p>
                  {(filters.search || filters.category) && (
                    <Link href="/noticias" className="text-primary text-sm mt-2 inline-block hover:underline">
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
                      className="group card-modern overflow-hidden"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={item.cover_image_url || `/placeholder-news.svg`}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          width={600}
                          height={400}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {item.category && (
                          <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                            {item.category.name}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(item.published_at)}</span>
                        </div>
                        <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                          {item.title}
                        </h2>
                        {item.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                        )}
                        <div className="flex items-center gap-1 text-primary text-sm font-medium mt-4 group-hover:gap-2 transition-all">
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
                      className="flex items-center gap-2 px-5 py-2.5 card-modern text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Página {news.meta.current_page} de {news.meta.last_page}
                  </span>
                  {news.meta.current_page < news.meta.last_page && (
                    <Link
                      href={`/noticias?page=${news.meta.current_page + 1}&categoria=${filters.category}&busca=${filters.search}`}
                      className="flex items-center gap-2 px-5 py-2.5 card-modern text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Próxima <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
