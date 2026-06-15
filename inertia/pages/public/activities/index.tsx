import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, ChevronLeft, ChevronRight, User, X, Search, ArrowRight } from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";

interface Activity { id: number; title: string; slug: string; date: string; type?: string; author?: { name: string }; }
interface Filters { type?: string; year?: string; autor?: string; status?: string; search?: string; }
interface Props {
  activities: Activity[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  filters?: Filters;
  types?: string[];
  years?: number[];
  statuses?: string[];
}

const buildParams = (filters?: Filters) => {
  const params = new URLSearchParams();
  if (filters?.type) params.set("tipo", filters.type);
  if (filters?.year) params.set("ano", String(filters.year));
  if (filters?.autor) params.set("autor", filters.autor);
  if (filters?.status) params.set("situacao", filters.status);
  if (filters?.search) params.set("busca", filters.search);
  return params;
};

const pageUrl = (page: number, filters?: Filters) => {
  const params = buildParams(filters);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/atividades-legislativas${qs ? `?${qs}` : ""}`;
};

export default function ActivitiesIndex({ activities = [], pagination, filters = {}, types = [], years = [], statuses = [] }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  function applyFilters(patch: Partial<Filters>) {
    const next: Filters = { ...filters, ...patch };
    const params: Record<string, string> = {};
    if (next.type) params.tipo = next.type;
    if (next.year) params.ano = String(next.year);
    if (next.autor) params.autor = next.autor;
    if (next.status) params.situacao = next.status;
    if (next.search) params.busca = next.search;
    router.get("/atividades-legislativas", params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.type || filters.year || filters.status || filters.search);

  return (
    <>
      <SeoHead title="Atividades Legislativas - Câmara Municipal de Sumé" description="Acompanhe as atividades legislativas: projetos de lei, requerimentos, indicações e moções." url="/atividades-legislativas" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atividades Legislativas" }]} />
        <PageHero badge="Legislativo" title="Atividades Legislativas" subtitle="Projetos de Lei, Requerimentos, Indicações e Moções" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              {filters.autor && (
                <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
                  <User className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm text-foreground">
                    Exibindo matérias de autoria de <strong>{filters.autor}</strong>
                  </p>
                  <Link
                    href="/atividades-legislativas"
                    className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors no-underline shrink-0"
                  >
                    <X className="w-3.5 h-3.5" /> Limpar filtro
                  </Link>
                </div>
              )}

              {/* Toolbar de filtros */}
              <div data-reveal="up" className="mb-8 card-modern p-4 flex flex-col md:flex-row md:items-center gap-3">
                <form className="relative md:flex-1" onSubmit={(e) => { e.preventDefault(); applyFilters({ search: searchTerm }); }}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar matéria..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </form>
                <select
                  value={filters.type || ""}
                  onChange={(e) => applyFilters({ type: e.target.value })}
                  className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todos os tipos</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={filters.year || ""}
                  onChange={(e) => applyFilters({ year: e.target.value })}
                  className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todos os anos</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {statuses.length > 0 && (
                  <select
                    value={filters.status || ""}
                    onChange={(e) => applyFilters({ status: e.target.value })}
                    className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer capitalize"
                  >
                    <option value="">Todas as situações</option>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
                {hasFilters && (
                  <button
                    onClick={() => { setSearchTerm(""); applyFilters({ type: "", year: "", status: "", search: "" }); }}
                    className="w-full md:w-auto h-11 flex items-center justify-center gap-1.5 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" /> Limpar
                  </button>
                )}
              </div>

              {pagination?.total !== undefined && (
                <p data-reveal="fade" className="mb-6 text-sm text-muted-foreground text-right">
                  {pagination.total} {pagination.total === 1 ? "matéria encontrada" : "matérias encontradas"}
                </p>
              )}

              {activities.length > 0 ? (
                <div className="grid gap-4">
                  {activities.map((activity, i) => {
                    const year = String(activity.date || "").slice(0, 4);
                    return (
                      <Link key={activity.id} href={`/atividades-legislativas/${activity.slug}`} className="group no-underline block" data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 60)}>
                        <div className="card-modern p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover-lift">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><FileText className="w-6 h-6 text-primary" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              {activity.type && <span className="px-2.5 py-0.5 bg-gold/15 text-navy-dark dark:text-gold rounded-full text-xs font-semibold uppercase tracking-wide">{activity.type}</span>}
                              {year && <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">{year}</span>}
                            </div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{activity.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                              {activity.date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDocumentDate(activity.date)}</span>}
                              {activity.author && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{activity.author.name}</span>}
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors shrink-0">
                            Detalhes <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma atividade encontrada</h3>
                  <p className="text-muted-foreground text-sm">{hasFilters || filters.autor ? "Tente ajustar os filtros de busca" : "Em breve novas matérias"}</p>
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
