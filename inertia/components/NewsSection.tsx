import { Link } from "@inertiajs/react";
import { Calendar, ArrowRight } from "lucide-react";
import { getNewsLayout } from "~/lib/news-layouts";

export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
  slug: string;
  featured?: boolean;
}

export const NEWS_PLACEHOLDER = "/images/placeholder-news.jpg";

interface NewsSectionProps {
  news?: NewsItem[];
  backgroundImage?: string | null;
  /** Modelo de exibição: mosaico | grade | lista | destaque (Aparência → Notícias) */
  layout?: string | null;
  /** Máximo de cards exibidos (painel → personalizar modelo) */
  limit?: number;
}

/**
 * Painel de notícias para a coluna direita do hero (modelo Moderno):
 * destaque + lista vertical compacta.
 */
export function NewsHeroPanel({ news, limit }: { news: NewsItem[]; limit?: number }) {
  if (news.length === 0) return null;
  const capped = limit ? news.slice(0, limit) : news;
  const featured = capped.find((n) => n.featured) || capped[0];
  const others = capped.filter((n) => n.id !== featured?.id).slice(0, 4);

  return (
    <div className="flex flex-col gap-4" data-reveal="fade-left">
      {featured && (
        <Link href={`/noticias/${featured.slug}`} className="no-underline">
          <article className="relative group cursor-pointer">
            <div className="relative min-h-[200px] sm:min-h-[220px] rounded-2xl overflow-hidden shadow-2xl border border-primary-foreground/10">
              <img
                src={featured.image || NEWS_PLACEHOLDER}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-gold text-xs mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{featured.date}</span>
                </div>
                <h2 className="text-lg lg:text-xl font-bold text-primary-foreground group-hover:text-gold transition-colors leading-snug line-clamp-2">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-1.5 text-primary-foreground/75 text-sm line-clamp-2 hidden sm:block">
                    {featured.excerpt}
                  </p>
                )}
              </div>
            </div>
          </article>
        </Link>
      )}
      {others.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {others.map((item, index) => (
            <Link href={`/noticias/${item.slug}`} key={item.id} className="no-underline">
              <article
                className="group cursor-pointer flex gap-3 rounded-xl bg-primary-foreground/[0.07] border border-primary-foreground/10 hover:border-gold/40 hover:bg-primary-foreground/10 transition-all duration-300 p-2.5"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative w-16 sm:w-[4.5rem] shrink-0 rounded-lg overflow-hidden aspect-square">
                  <img
                    src={item.image || NEWS_PLACEHOLDER}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-gold/90 text-[11px] mb-0.5">{item.date}</span>
                  <h3 className="text-sm font-semibold text-primary-foreground group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const NewsSection = ({ news = [], backgroundImage, layout, limit }: NewsSectionProps) => {
  const items = limit ? news.slice(0, limit) : news;
  if (items.length === 0) return null;
  const variant = getNewsLayout(layout);

  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      {/* Fundo (imagem opcional) */}
      {backgroundImage ? (
        <div className="absolute inset-0 overflow-hidden">
          <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy-dark/85" />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-sky/5 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative container py-14 lg:py-20">
        {variant === "grade" && <GridLayout news={items} />}
        {variant === "lista" && <ListLayout news={items} />}
        {variant === "destaque" && <HighlightListLayout news={items} />}
        {variant === "mosaico" && <MosaicLayout news={items} />}
      </div>

      {/* Barra "ver mais" */}
      <div className="relative bg-navy-dark/90 backdrop-blur-sm border-t border-white/10">
        <div className="container py-4 flex justify-end">
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

/* ============================ MOSAICO (padrão) ============================ */
function MosaicLayout({ news }: { news: NewsItem[] }) {
  const featured = news.find((n) => n.featured) || news[0];
  const others = news.filter((n) => n.id !== featured?.id).slice(0, 4);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {featured && (
        <Link href={`/noticias/${featured.slug}`} className="no-underline">
          <article className="relative group cursor-pointer h-full animate-fade-in">
            <div className="relative h-full min-h-[400px] lg:min-h-[520px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={featured.image || NEWS_PLACEHOLDER}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-gold text-sm mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{featured.date}</span>
                </div>
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-primary-foreground mb-3 group-hover:text-gold transition-colors duration-500 leading-tight">
                  {featured.title}
                </h2>
                <p className="text-primary-foreground/80 text-sm lg:text-base line-clamp-2 hidden sm:block">
                  {featured.excerpt}
                </p>
              </div>
            </div>
          </article>
        </Link>
      )}
      <div className="grid grid-cols-2 gap-4 lg:gap-5 h-full">
        {others.map((item, index) => (
          <Link href={`/noticias/${item.slug}`} key={item.id} className="no-underline">
            <article
              className="relative group cursor-pointer h-full animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-full min-h-[180px] lg:min-h-[250px] rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={item.image || NEWS_PLACEHOLDER}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                  <span className="inline-block text-gold/90 text-xs mb-1.5">{item.date}</span>
                  <h3 className="text-sm lg:text-base font-bold text-primary-foreground group-hover:text-gold transition-colors duration-500 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ============================ GRADE ============================ */
function GridLayout({ news }: { news: NewsItem[] }) {
  const items = news.slice(0, 6);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
      {items.map((item, index) => (
        <Link href={`/noticias/${item.slug}`} key={item.id} className="no-underline">
          <article
            className="group cursor-pointer h-full rounded-2xl overflow-hidden shadow-lg bg-white/[0.06] border border-white/10 hover:border-gold/40 hover:-translate-y-1 transition-all duration-300 animate-fade-in flex flex-col"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={item.image || NEWS_PLACEHOLDER}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 to-transparent" />
            </div>
            <div className="p-4 lg:p-5 flex flex-col flex-1">
              <span className="inline-flex items-center gap-1.5 text-gold/90 text-xs mb-2">
                <Calendar className="w-3.5 h-3.5" />
                {item.date}
              </span>
              <h3 className="text-base font-bold text-primary-foreground group-hover:text-gold transition-colors line-clamp-2 leading-snug mb-1.5">
                {item.title}
              </h3>
              <p className="text-primary-foreground/70 text-sm line-clamp-2">{item.excerpt}</p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

/* ============================ LISTA ============================ */
function ListLayout({ news }: { news: NewsItem[] }) {
  const items = news.slice(0, 6);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
      {items.map((item, index) => (
        <Link href={`/noticias/${item.slug}`} key={item.id} className="no-underline">
          <article
            className="group cursor-pointer flex gap-4 rounded-2xl overflow-hidden bg-white/[0.06] border border-white/10 hover:border-gold/40 hover:bg-white/[0.1] transition-all duration-300 animate-fade-in p-3"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="relative w-28 sm:w-36 shrink-0 rounded-xl overflow-hidden aspect-[4/3]">
              <img
                src={item.image || NEWS_PLACEHOLDER}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center min-w-0 py-1">
              <span className="inline-flex items-center gap-1.5 text-gold/90 text-xs mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {item.date}
              </span>
              <h3 className="text-base font-bold text-primary-foreground group-hover:text-gold transition-colors line-clamp-2 leading-snug mb-1">
                {item.title}
              </h3>
              <p className="text-primary-foreground/70 text-sm line-clamp-2 hidden sm:block">
                {item.excerpt}
              </p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

/* ============================ DESTAQUE + LISTA ============================ */
function HighlightListLayout({ news }: { news: NewsItem[] }) {
  const featured = news.find((n) => n.featured) || news[0];
  const others = news.filter((n) => n.id !== featured?.id).slice(0, 5);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-8">
      {featured && (
        <Link href={`/noticias/${featured.slug}`} className="no-underline">
          <article className="relative group cursor-pointer h-full animate-fade-in">
            <div className="relative h-full min-h-[320px] lg:min-h-[460px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={featured.image || NEWS_PLACEHOLDER}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-gold text-sm mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{featured.date}</span>
                </div>
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-primary-foreground mb-3 group-hover:text-gold transition-colors leading-tight">
                  {featured.title}
                </h2>
                <p className="text-primary-foreground/80 text-sm lg:text-base line-clamp-2 hidden sm:block">
                  {featured.excerpt}
                </p>
              </div>
            </div>
          </article>
        </Link>
      )}
      <div className="flex flex-col gap-3">
        {others.map((item, index) => (
          <Link href={`/noticias/${item.slug}`} key={item.id} className="no-underline">
            <article
              className="group cursor-pointer flex gap-3.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-gold/40 hover:bg-white/[0.1] transition-all duration-300 animate-fade-in p-2.5"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative w-20 shrink-0 rounded-lg overflow-hidden aspect-square">
                <img
                  src={item.image || NEWS_PLACEHOLDER}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-gold/90 text-[11px] mb-1">{item.date}</span>
                <h3 className="text-sm font-semibold text-primary-foreground group-hover:text-gold transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
