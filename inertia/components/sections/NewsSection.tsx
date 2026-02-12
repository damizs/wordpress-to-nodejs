import { Calendar, ArrowRight } from 'lucide-react'

interface NewsItem {
  id: number; title: string; excerpt: string | null; slug: string
  coverImageUrl: string | null; publishedAt: string
  category?: { name: string } | null
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const placeholders = [
  'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop',
]

export function NewsSection({ news }: { news: NewsItem[] }) {
  if (!news.length) return null
  const featured = news[0]
  const others = news.slice(1, 5)

  return (
    <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gold-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-sky-400/5 rounded-full blur-3xl" />
      </div>
      <div className="relative container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <a href={`/noticias/${featured.slug}`} className="relative group cursor-pointer lg:row-span-2">
            <div className="relative h-full min-h-[450px] lg:min-h-[550px] rounded-3xl overflow-hidden shadow-2xl">
              <img src={featured.coverImageUrl || placeholders[0]} alt={featured.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-gold-400 text-sm mb-4">
                  <Calendar className="w-4 h-4" /><span>{formatDate(featured.publishedAt)}</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-heading font-bold text-white mb-4 group-hover:text-gold-400 transition-colors leading-tight">{featured.title}</h2>
                {featured.excerpt && <p className="text-white/80 text-base lg:text-lg line-clamp-2">{featured.excerpt}</p>}
              </div>
            </div>
          </a>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {others.map((n, i) => (
              <a key={n.id} href={`/noticias/${n.slug}`} className="relative group cursor-pointer">
                <div className="relative h-56 rounded-2xl overflow-hidden shadow-lg">
                  <img src={n.coverImageUrl || placeholders[(i + 1) % 5]} alt={n.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block text-gold-400/80 text-xs mb-2">{formatDate(n.publishedAt)}</span>
                    <h3 className="text-sm font-heading font-bold text-white group-hover:text-gold-400 transition-colors line-clamp-2 leading-snug">{n.title}</h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="text-center mt-12">
          <a href="/noticias" className="group inline-flex items-center gap-3 px-6 py-3 glass rounded-full text-gold-400 hover:bg-gold-400 hover:text-navy-900 transition-all duration-500 font-medium">
            Ver mais notícias <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}
