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
}

export const NewsSection = ({ news = [] }: NewsSectionProps) => {
  const featuredNews = news.find((n) => n.featured) || news[0];
  const otherNews = news.filter((n) => n.id !== featuredNews?.id).slice(0, 4);

  if (news.length === 0) {
    return null;
  }

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
            <Link href={`/noticias/${featuredNews.slug}`} className="no-underline">
              <article className="relative group cursor-pointer lg:row-span-2 animate-fade-in">
                <div className="relative h-full min-h-[450px] lg:min-h-[550px] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={featuredNews.image || "/images/placeholder-news.jpg"}
                    alt={featuredNews.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-gold text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{featuredNews.date}</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-4 group-hover:text-gold transition-colors duration-500 leading-tight">
                      {featuredNews.title}
                    </h2>
                    <p className="text-primary-foreground/80 text-base lg:text-lg line-clamp-2">
                      {featuredNews.excerpt}
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          )}

          {/* Other News Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {otherNews.map((newsItem, index) => (
              <Link href={`/noticias/${newsItem.slug}`} key={newsItem.id} className="no-underline">
                <article
                  className="relative group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-56 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={newsItem.image || "/images/placeholder-news.jpg"}
                      alt={newsItem.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <span className="inline-block text-gold/80 text-xs mb-2">{newsItem.date}</span>
                      <h3 className="text-sm font-bold text-primary-foreground group-hover:text-gold transition-colors duration-500 line-clamp-2 leading-snug">
                        {newsItem.title}
                      </h3>
                    </div>
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
