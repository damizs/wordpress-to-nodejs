import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, Search, X, Newspaper } from "lucide-react";
import { FilterBar } from "~/components/FilterBar";

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

interface Filters {
  category?: string;
  year?: string;
  search?: string;
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
  filters?: Filters;
}

const toParams = (filters: Filters): Record<string, string> => {
  const params: Record<string, string> = {};
  if (filters.category) params.categoria = filters.category;
  if (filters.year) params.ano = filters.year;
  if (filters.search) params.busca = filters.search;
  return params;
};

const pageUrl = (page: number, filters: Filters) => {
  const params = new URLSearchParams(toParams(filters));
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/noticias${qs ? `?${qs}` : ""}`;
};

export default function NewsIndex({ news, categories = [], filters = {} }: Props) {
  const items = news?.data || [];
  const pagination = news?.meta ? {
    currentPage: news.meta.currentPage || news.meta.current_page || 1,
    lastPage: news.meta.lastPage || news.meta.last_page || 1,
    total: news.meta.total || 0,
  } : null;

  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Helpers
  const getImage = (item: NewsItem) => item.coverImageUrl || item.cover_image_url || item.featured_image;
  const getDate = (item: NewsItem) => item.publishedAt || item.published_at || new Date().toISOString();

  // Anos disponíveis (últimos 5 anos)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  function applyFilters(patch: Partial<Filters>) {
    router.get("/noticias", toParams({ ...filters, ...patch }), { preserveScroll: true });
  }

  const clearFilters = () => {
    setSearchTerm("");
    router.get("/noticias");
  };

  const hasFilters = !!(filters.category || filters.year || filters.search);

  return (
    <>
      <SeoHead
        title="Notícias - Câmara Municipal de Sumé"
        description="Acompanhe as últimas notícias e acontecimentos da Câmara Municipal de Sumé."
        url="/noticias"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Notícias" }]} />
        <PageHero
          badge="Fique por dentro"
          title="Notícias"
          subtitle="Acompanhe as últimas notícias da Câmara Municipal"
        />

        <main id="conteudo" tabIndex={-1} role="main">
          <section className="py-10 lg:py-14">
            <div className="container">
              <FilterBar>
                <form className="filter-search" onSubmit={(e) => { e.preventDefault(); applyFilters({ search: searchTerm }); }}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar notícia..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </form>
                <select
                  value={filters.category || ""}
                  onChange={(e) => applyFilters({ category: e.target.value })}
                  className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={filters.year || ""}
                  onChange={(e) => applyFilters({ year: e.target.value })}
                  className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todos os anos</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full md:w-auto h-11 flex items-center justify-center gap-1.5 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" /> Limpar
                  </button>
                )}
              </FilterBar>

              {pagination && (
                <p data-reveal="fade" className="mb-6 text-sm text-muted-foreground text-right">
                  {pagination.total} {pagination.total === 1 ? "notícia encontrada" : "notícias encontradas"}
                </p>
              )}

              {/* Grid de Notícias */}
              {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item, i) => (
                    <Link
                      key={item.id}
                      href={`/noticias/${item.slug}`}
                      className="group no-underline"
                      data-reveal="up"
                      data-reveal-delay={String(Math.min(i, 8) * 60)}
                    >
                      <article className="card-modern overflow-hidden h-full flex flex-col">
                        {/* Imagem */}
                        <div className="relative h-48 overflow-hidden">
                          {getImage(item) ? (
                            <img
                              src={getImage(item)}
                              alt={item.title}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/15 via-primary/5 to-gold/15 flex flex-col items-center justify-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-card/70 backdrop-blur-sm ring-1 ring-gold/30 flex items-center justify-center">
                                <Newspaper className="w-6 h-6 text-primary/60" aria-hidden="true" />
                              </div>
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/50">
                                Câmara de Sumé
                              </span>
                            </div>
                          )}
                          {item.category && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md">
                              {item.category.name}
                            </span>
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(getDate(item)).toLocaleDateString("pt-BR")}
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
                    <Newspaper className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma notícia encontrada</h3>
                  <p className="text-muted-foreground text-sm">
                    {hasFilters ? "Tente ajustar os filtros de busca" : "Em breve publicaremos novidades"}
                  </p>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              )}

              {/* Paginação */}
              {pagination && pagination.lastPage > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  {pagination.currentPage > 1 && (
                    <Link
                      href={pageUrl(pagination.currentPage - 1, filters)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors no-underline"
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Página {pagination.currentPage} de {pagination.lastPage}
                  </span>
                  {pagination.currentPage < pagination.lastPage && (
                    <Link
                      href={pageUrl(pagination.currentPage + 1, filters)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors no-underline"
                    >
                      Próxima <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
