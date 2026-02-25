import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import { useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  coverImageUrl?: string;
  cover_image_url?: string;
  publishedAt?: string;
  published_at?: string;
  category?: { id: number; name: string };
}

interface Props {
  news: {
    data: NewsItem[];
    meta: {
      currentPage: number;
      current_page?: number;
      lastPage: number;
      last_page?: number;
      total: number;
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
  
  // Helper para pegar a imagem (aceita ambos os formatos)
  const getImage = (item: NewsItem) => getImage(item) || item.cover_image_url;
  const getDate = (item: NewsItem) => getDate(item) || item.published_at || new Date().toISOString();

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

        <main className="py-12">
          <div className="container mx-auto px-4">
            
            {/* Filters */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              
              {categories.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Link
                    href="/noticias"
                    className="px-3 py-1.5 text-sm rounded-full bg-primary text-white no-underline"
                  >
                    Todas
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/noticias?categoria=${cat.id}`}
                      className="px-3 py-1.5 text-sm rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-colors no-underline"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Featured News */}
            {items.length > 0 && (
              <div className="mb-12">
                <Link
                  href={`/noticias/${items[0].slug}`}
                  className="group block no-underline"
                >
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-hero">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-96">
                        {getImage(items[0]) ? (
                          <img
                            src={getImage(items[0])}
                            alt={items[0].title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-gold/30 flex items-center justify-center">
                            <span className="text-6xl">📰</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent md:hidden" />
                      </div>
                      <div className="p-8 md:p-12 flex flex-col justify-center bg-navy-dark text-white">
                        {items[0].category && (
                          <span className="inline-block w-fit px-3 py-1 bg-gold text-navy-dark text-xs font-bold rounded-full mb-4">
                            {items[0].category.name}
                          </span>
                        )}
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-gold transition-colors">
                          {items[0].title}
                        </h2>
                        {items[0].excerpt && (
                          <p className="text-white/70 mb-6 line-clamp-3">
                            {items[0].excerpt}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <Calendar className="w-4 h-4" />
                            {new Date(getDate(items[0])).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                          <span className="flex items-center gap-2 text-gold font-semibold group-hover:gap-3 transition-all">
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

            {/* News Grid */}
            {items.length > 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.slice(1).map((item) => (
                  <Link
                    key={item.id}
                    href={`/noticias/${item.slug}`}
                    className="group no-underline"
                  >
                    <article className="card-modern overflow-hidden h-full flex flex-col">
                      <div className="relative h-52 overflow-hidden">
                        {getImage(item) ? (
                          <img
                            src={getImage(item)}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center">
                            <span className="text-5xl opacity-50">📰</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 to-transparent" />
                        {item.category && (
                          <span className="absolute top-4 left-4 px-3 py-1 bg-gold text-navy-dark text-xs font-bold rounded-full">
                            {item.category.name}
                          </span>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(getDate(item)).toLocaleDateString('pt-BR')}
                        </div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
                          {item.title}
                        </h3>
                        {item.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                            {item.excerpt}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-2 text-sm text-primary font-semibold">
                          Ler mais
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : items.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-4xl">📰</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nenhuma notícia encontrada
                </h3>
                <p className="text-muted-foreground">
                  Em breve publicaremos novidades. Volte mais tarde!
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.lastPage > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                {pagination.currentPage > 1 && (
                  <Link
                    href={`/noticias?page=${pagination.currentPage - 1}`}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors no-underline"
                  >
                    <ChevronLeft className="w-4 h-4" />
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
                      <span key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Link
                          href={`/noticias?page=${page}`}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg no-underline transition-colors ${
                            page === pagination.currentPage
                              ? 'bg-primary text-white'
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
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors no-underline"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" />
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
