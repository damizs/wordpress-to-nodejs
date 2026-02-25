import { Link } from "@inertiajs/react";
import { Calendar, ArrowRight, Play } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
  slug: string;
  featured?: boolean;
}

interface NewsSectionProps {
  news?: NewsItem[];
  backgroundImage?: string | null;
}

export const NewsSection = ({ news = [], backgroundImage }: NewsSectionProps) => {
  const featuredNews = news.find((n) => n.featured) || news[0];
  const otherNews = news.filter((n) => n.id !== featuredNews?.id).slice(0, 4);

  if (news.length === 0) {
    return null;
  }

  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <img 
            src={backgroundImage} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy-dark/85" />
        </div>
      )}
      
      {/* Background decorations (fallback when no image) */}
      {!backgroundImage && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-sky/5 rounded-full blur-3xl" />
        </div>
      )}

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Featured News */}
          {featuredNews && (
            <Link href={`/noticias/${featuredNews.slug}`} className="no-underline">
              <article className="relative group cursor-pointer h-full animate-fade-in">
                <div className="relative h-full min-h-[400px] lg:min-h-[520px] rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={featuredNews.image || "/images/placeholder-news.jpg"}
                    alt={featuredNews.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-gold text-sm mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredNews.date}</span>
                    </div>
                    <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-primary-foreground mb-3 group-hover:text-gold transition-colors duration-500 leading-tight">
                      {featuredNews.title}
                    </h2>
                    <p className="text-primary-foreground/80 text-sm lg:text-base line-clamp-2 hidden sm:block">
                      {featuredNews.excerpt}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Other News Grid - 2x2 with equal heights */}
          <div className="grid grid-cols-2 gap-4 lg:gap-5 h-full">
            {otherNews.map((newsItem, index) => (
              <Link href={`/noticias/${newsItem.slug}`} key={newsItem.id} className="no-underline">
                <article
                  className="relative group cursor-pointer h-full animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-full min-h-[180px] lg:min-h-[250px] rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={newsItem.image || "/images/placeholder-news.jpg"}
                      alt={newsItem.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                      <span className="inline-block text-gold/90 text-xs mb-1.5">{newsItem.date}</span>
                      <h3 className="text-sm lg:text-base font-bold text-primary-foreground group-hover:text-gold transition-colors duration-500 line-clamp-2 leading-snug">
                        {newsItem.title}
                      </h3>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* View More Bar - Full Width */}
      <div className="relative bg-navy-dark/90 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          <Link
            href="/noticias"
            className="group inline-flex items-center gap-3 px-6 py-2.5 bg-white/10 hover:bg-gold hover:text-navy-dark rounded-full text-white font-medium no-underline transition-all duration-300"
          >
            Ver mais notícias
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
