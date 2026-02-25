import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  coverImageUrl?: string;
  cover_image_url?: string;
  featured_image?: string;
  publishedAt?: string;
  published_at?: string;
  category?: { id: number; name: string };
}

interface Props {
  news: {
    data: NewsItem[];
    meta?: {
      currentPage?: number;
      current_page?: number;
      lastPage?: number;
      last_page?: number;
      total?: number;
    };
  };
  categories?: { id: number; name: string }[];
}

export default function NewsIndex({ news, categories = [] }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const items = news?.data || [];
  const pagination = news?.meta ? {
    currentPage: news.meta.currentPage || news.meta.current_page || 1,
    lastPage: news.meta.lastPage || news.meta.last_page || 1,
    total: news.meta.total || 0
  } : null;
  
  // Helpers para campos que podem vir em camelCase ou snake_case
  const getImage = (item: NewsItem) => item.coverImageUrl || item.cover_image_url || item.featured_image;
  const getDate = (item: NewsItem) => item.publishedAt || item.published_at || new Date().toISOString();

  // Separar notícia em destaque das demais
  const featuredNews = items[0];
  const otherNews = items.slice(1);

  return (
    <>
      <SeoHead
        title="Notícias - Câmara Municipal de Sumé"
        description="Acompanhe as últimas notícias e acontecimentos da Câmara Municipal de Sumé."
        url="/noticias"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        
        {/* Hero Section */}
        <PageHero
          title="Notícias"
          subtitle="Acompanhe as últimas notícias e acontecimentos da Câmara Municipal de Sumé"
          breadcrumbs={[{ label: "Notícias" }]}
        />

        <main className="py-16">
          <div className="container mx-auto px-6 lg:px-8">
            
            {/* Search Bar */}
            <div className="mb-12 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-lg shadow-sm"
                />
              </div>
            </div>

            {/* Featured News */}
            {featuredNews && (
              <div className="mb-16">
                <Link
                  href={`/noticias/${featuredNews.slug}`}
                  className="group block no-underline"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Image Side */}
                      <div className="relative h-72 lg:h-[450px]">
                        {getImage(featuredNews) ? (
                          <img
                            src={getImage(featuredNews)}
                            alt={featuredNews.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-gold/30 flex items-center justify-center">
                            <span className="text-8xl">📰</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent lg:hidden" />
                      </div>
                      
                      {/* Content Side */}
                      <div className="p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-navy-dark to-navy-dark/95 text-white">
                        <div className="mb-6">
                          <span className="inline-block px-4 py-2 bg-gold text-navy-dark text-sm font-bold rounded-full">
                            Destaque
                          </span>
                        </div>
                        
                        <h2 className="text-2xl lg:text-4xl font-bold mb-6 leading-tight group-hover:text-gold transition-colors">
                          {featuredNews.title}
                        </h2>
                        
                        {featuredNews.excerpt && (
                          <p className="text-white/70 text-lg mb-8 line-clamp-3 leading-relaxed">
                            {featuredNews.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-3 text-white/60">
                            <Calendar className="w-5 h-5" />
                            <span className="text-base">
                              {new Date(getDate(featuredNews)).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <span className="flex items-center gap-2 text-gold font-semibold text-lg group-hover:gap-4 transition-all">
                            Ler notícia
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Section Title */}
            {otherNews.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-foreground">Mais Notícias</h2>
                <div className="mt-2 w-20 h-1 bg-gold rounded-full"></div>
              </div>
            )}

            {/* News Grid */}
            {otherNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {otherNews.map((item) => (
                  <Link
                    key={item.id}
                    href={`/noticias/${item.slug}`}
                    className="group no-underline"
                  >
                    <article className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-border/50">
                      {/* Image */}
                      <div className="relative h-56 overflow-hidden">
                        {getImage(item) ? (
                          <img
                            src={getImage(item)}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center">
                            <span className="text-6xl opacity-50">📰</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 to-transparent" />
                        {item.category && (
                          <span className="absolute top-4 left-4 px-3 py-1.5 bg-gold text-navy-dark text-xs font-bold rounded-full shadow-lg">
                            {item.category.name}
                          </span>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Calendar className="w-4 h-4" />
                          {new Date(getDate(item)).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 leading-snug">
                          {item.title}
                        </h3>
                        
                        {item.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">
                            {item.excerpt}
                          </p>
                        )}
                        
                        <div className="mt-5 pt-5 border-t border-border flex items-center gap-2 text-primary font-semibold">
                          Ler mais
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : items.length === 0 && (
              <div className="text-center py-24">
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-5xl">📰</span>
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Nenhuma notícia encontrada
                </h3>
                <p className="text-muted-foreground text-lg">
                  Em breve publicaremos novidades. Volte mais tarde!
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.lastPage > 1 && (
              <div className="mt-16 flex items-center justify-center gap-3">
                {pagination.currentPage > 1 && (
                  <Link
                    href={`/noticias?page=${pagination.currentPage - 1}`}
                    className="flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-xl text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all no-underline shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Anterior
                  </Link>
                )}
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                    .filter(page => {
                      const current = pagination.currentPage;
                      return page === 1 || page === pagination.lastPage || 
                             (page >= current - 1 && page <= current + 1);
                    })
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Link
                          href={`/noticias?page=${page}`}
                          className={`w-12 h-12 flex items-center justify-center rounded-xl no-underline transition-all font-medium shadow-sm ${
                            page === pagination.currentPage
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-card border border-border text-foreground hover:bg-muted'
                          }`}
                        >
                          {page}
                        </Link>
                      </span>
                    ))}
                </div>

                {pagination.currentPage < pagination.lastPage && (
                  <Link
                    href={`/noticias?page=${pagination.currentPage + 1}`}
                    className="flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-xl text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all no-underline shadow-sm"
                  >
                    Próxima
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
