import { Link } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import SeoHead from '~/components/SeoHead'
import { Calendar, User, Eye, Share2 } from 'lucide-react'

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
    <>
      <SeoHead
        title={`${news.title} - Câmara Municipal de Sumé`}
        description={news.excerpt || news.title}
        image={news.cover_image_url}
        url={`/noticias/${news.slug}`}
        type="article"
        publishedAt={news.published_at}
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[
            { label: 'Notícias', href: '/noticias' },
            { label: news.title }
          ]} />

          {/* Hero with cover image */}
          <section className="relative h-72 lg:h-96 overflow-hidden">
            <img
              src={news.cover_image_url || `/placeholder-news.svg`}
              alt={news.title}
              className="w-full h-full object-cover"
              fetchPriority="high"
              width={1200}
              height={600}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy-dark))] via-[hsl(var(--navy-dark))]/60 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
              <div className="container mx-auto max-w-4xl">
                {news.category && (
                  <span className="inline-block bg-gold text-foreground text-xs font-semibold px-3 py-1 rounded-full mb-4">
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
          <section className="py-10">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(news.published_at)}</span>
                </div>
                {news.author && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{news.author.full_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{news.views_count} visualizações</span>
                </div>
                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
              </div>

              {/* Excerpt */}
              {news.excerpt && (
                <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-8">
                  {news.excerpt}
                </p>
              )}

              {/* Article content */}
              <article
                className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </div>
          </section>

          {/* Related News */}
          {related.length > 0 && (
            <section className="py-12 bg-muted/30 border-t border-border">
              <div className="container mx-auto px-4 max-w-4xl">
                <h2 className="text-xl font-serif font-bold text-foreground mb-6">Notícias Relacionadas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/noticias/${item.slug}`}
                      className="group card-modern overflow-hidden"
                    >
                      <div className="h-32 overflow-hidden">
                        <img
                          src={item.cover_image_url || '/placeholder-news.svg'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-xs text-muted-foreground">{formatDate(item.published_at)}</span>
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary line-clamp-2 mt-1 transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  )
}
