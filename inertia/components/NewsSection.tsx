import { Calendar, ArrowRight, Play } from "lucide-react";
import { Link } from "@inertiajs/react";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image_url?: string;
  published_at?: string;
  created_at?: string;
}

interface NewsSectionProps {
  news?: NewsItem[];
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const defaultImage = "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&h=600&fit=crop";

export const NewsSection = ({ news = [] }: NewsSectionProps) => {
  if (news.length === 0) return null;
  
  const featuredNews = news[0];
  const otherNews = news.slice(1, 5);

  return (
    <section className="relative bg-gradient-hero py-20 px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-sky/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News */}
          {featuredNews && (
            <Link href={`/noticias/${featuredNews.slug}`} className="relative group lg:row-span-2 animate-fade-in no-underline">
              <article className="relative h-full min-h-[450px] lg:min-h-[550px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={featuredNews.image_url || defaultImage}
                  alt={featuredNews.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
                    <span>{formatDate(featuredNews.published_at || featuredNews.created_at)}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-serif font-bold text-primary-foreground mb-4 group-hover:text-gold transition-colors duration-500 leading-tight">
                    {featuredNews.title}
                  </h2>
                  <p className="text-primary-foreground/80 text-base lg:text-lg line-clamp-2">
                    {featuredNews.excerpt || ''}
                  </p>
                </div>
              </article>
            </Link>
          )}

          {/* Other News Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {otherNews.map((item, index) => (
              <Link
                key={item.id}
                href={`/noticias/${item.slug}`}
                className="relative group animate-fade-in no-underline"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <article className="relative h-56 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={item.image_url || defaultImage}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block text-gold/80 text-xs mb-2">
                      {formatDate(item.published_at || item.created_at)}
                    </span>
                    <h3 className="text-sm font-serif font-bold text-primary-foreground group-hover:text-gold transition-colors duration-500 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* View More Link */}
        <div className="text-center mt-12">
          <Link
            href="/noticias"
            className="group inline-flex items-center gap-3 px-6 py-3 glass rounded-full text-gold hover:bg-gold hover:text-navy-dark transition-all duration-500 font-medium no-underline"
          >
            Ver mais notícias
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
