import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";

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
  filters?: {
    category?: string;
    year?: string;
  };
}

export default function NewsIndex({ news, categories = [], filters = {} }: Props) {
  const items = news?.data || [];
  const pagination = news?.meta ? {
    currentPage: news.meta.currentPage || news.meta.current_page || 1,
    lastPage: news.meta.lastPage || news.meta.last_page || 1,
    total: news.meta.total || 0
  } : null;
  
  // Helpers
  const getImage = (item: NewsItem) => item.coverImageUrl || item.cover_image_url || item.featured_image;
  const getDate = (item: NewsItem) => item.publishedAt || item.published_at || new Date().toISOString();

  // Anos disponíveis (últimos 5 anos)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Aplicar filtro
  const applyFilter = (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset página ao filtrar
    router.get(`/noticias?${params.toString()}`);
  };

  // Limpar filtros
  const clearFilters = () => {
    router.get('/noticias');
  };

  const hasFilters = filters.category || filters.year;

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
        
        <Breadcrumb items={[{ label: "Notícias" }]} />
        
        <PageHero
          title="Notícias"
          subtitle="Acompanhe as últimas notícias da Câmara Municipal"
        />

        <main className="py-12">
          <div className="container mx-auto px-6 lg:px-8">
            
            {/* Filtros */}
            <div className="mb-10 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filtrar:</span>
              </div>
              
              {/* Filtro por Categoria */}
              <select
                value={filters.category || ''}
                onChange={(e) => applyFilter('categoria', e.target.value)}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {/* Filtro por Ano */}
              <select
                value={filters.year || ''}
                onChange={(e) => applyFilter('ano', e.target.value)}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer"
              >
                <option value="">Todos os anos</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Limpar Filtros */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpar filtros
                </button>
              )}

              {/* Total de resultados */}
              {pagination && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {pagination.total} {pagination.total === 1 ? 'notícia' : 'notícias'}
                </span>
              )}
            </div>

            {/* Grid de Notícias */}
            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/noticias/${item.slug}`}
                    className="group no-underline"
                  >
                    <article className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                      {/* Imagem */}
                      <div className="relative h-48 overflow-hidden">
                        {getImage(item) ? (
                          <img
                            src={getImage(item)}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center">
                            <span className="text-5xl opacity-40">📰</span>
                          </div>
                        )}
                        {item.category && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-white text-xs font-medium rounded-md">
                            {item.category.name}
                          </span>
                        )}
                      </div>
                      
                      {/* Conteúdo */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(getDate(item)).toLocaleDateString('pt-BR')}
                        </div>
                        
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-auto">
                          {item.title}
                        </h3>
                        
                        <div className="mt-4 flex items-center gap-1 text-sm text-primary font-medium">
                          Ler mais
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-3xl">📰</span>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma notícia encontrada
                </h3>
                <p className="text-muted-foreground text-sm">
                  {hasFilters ? 'Tente ajustar os filtros' : 'Em breve publicaremos novidades'}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}

            {/* Paginação */}
            {pagination && pagination.lastPage > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {pagination.currentPage > 1 && (
                  <Link
                    href={`/noticias?page=${pagination.currentPage - 1}${filters.category ? `&categoria=${filters.category}` : ''}${filters.year ? `&ano=${filters.year}` : ''}`}
                    className="p-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors no-underline"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                )}
                
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  {pagination.currentPage} / {pagination.lastPage}
                </span>

                {pagination.currentPage < pagination.lastPage && (
                  <Link
                    href={`/noticias?page=${pagination.currentPage + 1}${filters.category ? `&categoria=${filters.category}` : ''}${filters.year ? `&ano=${filters.year}` : ''}`}
                    className="p-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors no-underline"
                  >
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
