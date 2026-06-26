import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, Search, X, ArrowRight, ChevronLeft, ChevronRight, Gavel } from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";
import { FilterBar } from "~/components/FilterBar";

interface Licitacao { id: number; title: string; slug: string; number: string; modality?: string; date: string; status?: string; }
interface Filters { status?: string; modality?: string; year?: string; search?: string; }
interface Props {
  licitacoes: Licitacao[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  filters?: Filters;
  years?: number[];
  modalities?: string[];
  statuses?: string[];
}

// Mapa unificado de status, keyed pela MESMA convenção dos valores do banco
// (snake_case). Cada entrada traz o rótulo legível e as classes de cor (tokens
// do design system, dark-safe). A lookup é normalizada (lowercase + trim +
// espaços -> _) para tolerar variações de cadastro.
const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  aberta: { label: "Aberta", classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  em_andamento: { label: "Em andamento", classes: "bg-sky/10 text-sky" },
  encerrada: { label: "Encerrada", classes: "bg-muted text-muted-foreground" },
  homologada: { label: "Homologada", classes: "bg-navy/10 text-navy dark:bg-sky/10 dark:text-sky" },
  cancelada: { label: "Cancelada", classes: "bg-destructive/10 text-destructive" },
  revogada: { label: "Revogada", classes: "bg-destructive/10 text-destructive" },
  suspensa: { label: "Suspensa", classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  deserta: { label: "Deserta", classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  concluida: { label: "Concluída", classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

const statusKey = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "_");

const statusLabel = (s: string) =>
  STATUS_MAP[statusKey(s)]?.label || s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const statusClasses = (s: string) =>
  STATUS_MAP[statusKey(s)]?.classes || "bg-muted text-muted-foreground";

const toParams = (filters: Filters): Record<string, string> => {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.modality) params.modalidade = filters.modality;
  if (filters.year) params.ano = filters.year;
  if (filters.search) params.busca = filters.search;
  return params;
};

const pageUrl = (page: number, filters: Filters) => {
  const params = new URLSearchParams(toParams(filters));
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/licitacoes${qs ? `?${qs}` : ""}`;
};

export default function LicitacoesIndex({ licitacoes = [], pagination, filters = {}, years = [], modalities = [], statuses = [] }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  function applyFilters(patch: Partial<Filters>) {
    router.get("/licitacoes", toParams({ ...filters, ...patch }), { preserveScroll: true });
  }

  const hasFilters = !!(filters.status || filters.modality || filters.year || filters.search);

  return (
    <>
      <SeoHead title="Licitações - Câmara Municipal de Sumé" description="Consulte os processos licitatórios da Câmara Municipal de Sumé." url="/licitacoes" />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Licitações" }]} />
        <PageHero badge="Transparência" title="Licitações" subtitle="Processos licitatórios e contratações da Câmara Municipal, com documentos por fase do processo" centered />
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
                    placeholder="Pesquisar licitação..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </form>
                {modalities.length > 0 && (
                  <select
                    value={filters.modality || ""}
                    onChange={(e) => applyFilters({ modality: e.target.value })}
                    className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Todas as modalidades</option>
                    {modalities.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                )}
                {statuses.length > 0 && (
                  <select
                    value={filters.status || ""}
                    onChange={(e) => applyFilters({ status: e.target.value })}
                    className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Todos os status</option>
                    {statuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                )}
                {years.length > 0 && (
                  <select
                    value={filters.year || ""}
                    onChange={(e) => applyFilters({ year: e.target.value })}
                    className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Todos os anos</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                )}
                {hasFilters && (
                  <button
                    onClick={() => { setSearchTerm(""); router.get("/licitacoes"); }}
                    className="w-full md:w-auto h-11 flex items-center justify-center gap-1.5 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" /> Limpar
                  </button>
                )}
              </FilterBar>

              {pagination?.total !== undefined && (
                <p data-reveal="fade" className="mb-6 text-sm text-muted-foreground text-right">
                  {pagination.total} {pagination.total === 1 ? "processo encontrado" : "processos encontrados"}
                </p>
              )}

              {licitacoes.length > 0 ? (
                <div className="space-y-4">
                  {licitacoes.map((lic, i) => {
                    const year = String(lic.date || "").slice(0, 4);
                    return (
                      <div key={lic.id} data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 60)} className="card-modern p-5 flex flex-col sm:flex-row sm:items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Gavel className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {lic.modality && <span className="px-2.5 py-0.5 bg-gold/15 text-navy-dark dark:text-gold rounded-full text-xs font-semibold uppercase tracking-wide">{lic.modality}</span>}
                            {year && <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">{year}</span>}
                            {lic.status && (
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClasses(lic.status)}`}>
                                {statusLabel(lic.status)}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                            <Link href={`/licitacoes/${lic.slug}`} className="no-underline text-foreground group-hover:text-primary transition-colors">
                              {lic.title}
                            </Link>
                          </h3>
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDocumentDate(lic.date)}</span>
                            {lic.number && <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{lic.number}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/licitacoes/${lic.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors no-underline"
                          >
                            Documentos <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Gavel className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma licitação encontrada</h3>
                  <p className="text-muted-foreground text-sm">{hasFilters ? "Tente ajustar os filtros de busca" : "Nenhuma licitação cadastrada"}</p>
                </div>
              )}

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
                  <span className="text-sm text-muted-foreground">Página {pagination.currentPage} de {pagination.lastPage}</span>
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
