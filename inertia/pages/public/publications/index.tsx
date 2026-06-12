import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, ChevronLeft, ChevronRight, Search, X, ArrowRight } from "lucide-react";
import { DownloadPdfButton, formatDocumentDate } from "~/components/DocumentActions";

interface Publication { id: number; title: string; slug: string; date: string; type?: string; file_url?: string; }
interface Filters { type?: string; year?: string; search?: string; }
interface Props {
  publications: Publication[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  filters?: Filters;
  types?: string[];
  years?: number[];
}

const pageUrl = (page: number, filters?: Filters) => {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (filters?.type) params.set("tipo", filters.type);
  if (filters?.year) params.set("ano", filters.year);
  if (filters?.search) params.set("busca", filters.search);
  const qs = params.toString();
  return `/publicacoes-oficiais${qs ? `?${qs}` : ""}`;
};

export default function PublicationsIndex({ publications = [], pagination, filters = {}, types = [], years = [] }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  function applyFilters(patch: Partial<Filters>) {
    const next: Filters = { ...filters, ...patch };
    const params: Record<string, string> = {};
    if (next.type) params.tipo = next.type;
    if (next.year) params.ano = next.year;
    if (next.search) params.busca = next.search;
    router.get("/publicacoes-oficiais", params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.type || filters.year || filters.search);

  return (
    <>
      <SeoHead title="Publicações Oficiais - Câmara Municipal de Sumé" description="Acesse as publicações oficiais da Câmara Municipal de Sumé." url="/publicacoes-oficiais" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Publicações Oficiais" }]} />
        <PageHero badge="Documentos" title="Publicações Oficiais" subtitle="Leis, decretos, portarias e demais atos oficiais da Câmara Municipal" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              {/* Toolbar de filtros */}
              <div data-reveal="up" className="max-w-4xl mx-auto mb-8 card-modern p-4 flex flex-col sm:flex-row gap-3">
                <form className="relative flex-1" onSubmit={(e) => { e.preventDefault(); applyFilters({ search: searchTerm }); }}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar publicação..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </form>
                <select
                  value={filters.type || ""}
                  onChange={(e) => applyFilters({ type: e.target.value })}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todos os tipos</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={filters.year || ""}
                  onChange={(e) => applyFilters({ year: e.target.value })}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todos os anos</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {hasFilters && (
                  <button
                    onClick={() => { setSearchTerm(""); router.get("/publicacoes-oficiais"); }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" /> Limpar
                  </button>
                )}
              </div>

              {pagination?.total !== undefined && (
                <p data-reveal="fade" className="max-w-4xl mx-auto mb-6 text-sm text-muted-foreground text-right">
                  {pagination.total} {pagination.total === 1 ? "publicação encontrada" : "publicações encontradas"}
                </p>
              )}

              {publications.length > 0 ? (
                <div className="max-w-4xl mx-auto space-y-4">
                  {publications.map((pub, i) => {
                    const year = String(pub.date || "").slice(0, 4);
                    return (
                      <div key={pub.id} data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 60)} className="card-modern p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover-lift group">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {pub.type && <span className="px-2.5 py-0.5 bg-gold/10 text-gold rounded-full text-xs font-semibold uppercase tracking-wide">{pub.type}</span>}
                            {year && <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">{year}</span>}
                          </div>
                          <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                            <Link href={`/publicacoes-oficiais/${pub.slug}`} className="no-underline text-foreground group-hover:text-primary transition-colors">
                              {pub.title}
                            </Link>
                          </h3>
                          <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-3.5 h-3.5" />{formatDocumentDate(pub.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <DownloadPdfButton fileUrl={pub.file_url} />
                          <Link
                            href={`/publicacoes-oficiais/${pub.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors no-underline"
                          >
                            Detalhes <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma publicação encontrada</h3>
                  <p className="text-muted-foreground text-sm">{hasFilters ? "Tente ajustar os filtros de busca" : "Em breve novas publicações"}</p>
                </div>
              )}

              {pagination && pagination.lastPage > 1 && (
                <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 mt-10">
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
