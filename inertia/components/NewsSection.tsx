import { Calendar, ArrowRight, Play } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  category?: { id: number; name: string } | null;
}

interface NewsSectionProps {
  news?: NewsItem[];
}

const placeholders = [
  "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop",
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// Fallback data when no news from DB yet
const fallbackNews: NewsItem[] = [
  { id: 1, title: "Câmara de Sumé aprova crédito de quase R$1 milhão para Educação e Infraestrutura", slug: "", excerpt: "A Câmara Municipal de Sumé realizou uma sessão extraordinária para aprovação de importantes projetos...", cover_image_url: placeholders[0], published_at: "2025-12-29T00:00:00" },
  { id: 2, title: "Câmara de Sumé Recebe Selo Ouro da ATRICON por Transparência Pública", slug: "", excerpt: "A Câmara Municipal foi agraciada com o Selo Ouro do Programa Nacional de Transparência...", cover_image_url: placeholders[1], published_at: "2025-12-22T00:00:00" },
  { id: 3, title: "Transparência e Participação Cidadã nas Sessões", slug: "", excerpt: "A Câmara mantém sua agenda de trabalho legislativo com participação ativa da população...", cover_image_url: placeholders[2], published_at: "2025-12-20T00:00:00" },
  { id: 4, title: "Participe da 2ª Audiência Pública sobre PPA e LOA", slug: "", excerpt: "Convite à população para participar da audiência pública dedicada ao planejamento municipal...", cover_image_url: placeholders[3], published_at: "2025-12-15T00:00:00" },
  { id: 5, title: "Centenário da Assembleia de Deus celebrado em sessão solene", slug: "", excerpt: "A Câmara realizou sessão solene em homenagem ao centenário da igreja na cidade...", cover_image_url: placeholders[4], published_at: "2025-11-17T00:00:00" },
];

export const NewsSection = ({ news }: NewsSectionProps) => {
  const items = news && news.length > 0 ? news : fallbackNews;
  const featuredNews = items[0];
  const otherNews = items.slice(1, 5);

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background image with dark overlay - like WordPress */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-hero" style={{ opacity: 0.92 }} />
      </div>

      {/* Decorative blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-sky/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Featured News */}
          {featuredNews && (
            <a href={`/noticias/${featuredNews.slug || featuredNews.id}`} className="relative group cursor-pointer animate-fade-in block">
              <div className="relative h-full min-h-[450px] lg:min-h-[550px] rounded-3xl overflow-hidden shadow-2xl bg-navy-dark/50">
                <img
                  src={featuredNews.cover_image_url || placeholders[0]}
                  alt={featuredNews.title}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  onLoad={(e) => e.currentTarget.classList.add('opacity-100')}
                  style={{ opacity: 1 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-20 h-20 rounded-full glass flex items-center justify-center animate-pulse-glow">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-gold text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(featuredNews.published_at)}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-serif font-bold text-primary-foreground mb-4 group-hover:text-gold transition-colors duration-500 leading-tight">
                    {featuredNews.title}
                  </h2>
                  <p className="text-primary-foreground/80 text-base lg:text-lg line-clamp-2">
                    {featuredNews.excerpt}
                  </p>
                </div>
              </div>
            </a>
          )}

          {/* Other News Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 auto-rows-fr">
            {otherNews.map((news, index) => (
              <a
                key={news.id}
                href={`/noticias/${news.slug || news.id}`}
                className="relative group cursor-pointer animate-fade-in block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-full min-h-[200px] rounded-2xl overflow-hidden shadow-lg bg-navy-dark/40">
                  <img
                    src={news.cover_image_url || placeholders[index + 1]}
                    alt={news.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block text-gold/80 text-xs mb-2">{formatDate(news.published_at)}</span>
                    <h3 className="text-sm font-serif font-bold text-primary-foreground group-hover:text-gold transition-colors duration-500 line-clamp-2 leading-snug">
                      {news.title}
                    </h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* View More Link */}
        <div className="text-center mt-12">
          <a
            href="/noticias"
            className="group inline-flex items-center gap-3 px-6 py-3 glass rounded-full text-gold hover:bg-gold hover:text-navy-dark transition-all duration-500 font-medium"
          >
            Ver mais notícias
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
