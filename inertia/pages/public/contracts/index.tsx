import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, Search, X, ArrowRight, ChevronLeft, ChevronRight, FileSignature, UserCheck, Coins, CheckCircle2, BarChart3 } from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";
import { FilterBar } from "~/components/FilterBar";

interface Contract {
  id: number;
  slug: string;
  number: string | null;
  year: number | null;
  object: string | null;
  modality: string | null;
  contractorName: string | null;
  value: number | null;
  startDate: string | null;
  endDate: string | null;
  term: string | null;
  status: string;
  fiscalName: string | null;
  managerName: string | null;
  fiscalAct: string | null;
  hasFile: boolean;
}
interface Filters { status?: string; year?: string; search?: string; }
interface Stats {
  total: number;
  vigentes: number;
  totalValue: number;
  byYear: { year: number; count: number }[];
}
interface Props {
  contracts: Contract[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  filters?: Filters;
  years?: number[];
  statuses?: string[];
  stats?: Stats;
}

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  vigente: { label: "Vigente", classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  encerrado: { label: "Encerrado", classes: "bg-muted text-muted-foreground" },
  rescindido: { label: "Rescindido", classes: "bg-destructive/10 text-destructive" },
  suspenso: { label: "Suspenso", classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
};
const statusLabel = (s: string) => STATUS_MAP[s]?.label || s;
const statusClasses = (s: string) => STATUS_MAP[s]?.classes || "bg-muted text-muted-foreground";

const fmtMoney = (v: number | null) =>
  v === null || v === undefined
    ? null
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v));

/** Moeda compacta para KPI (ex.: R$ 1,2 mi / R$ 850 mil). */
const fmtCompactMoney = (v: number) => {
  if (!v) return "R$ 0";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
};

const toParams = (filters: Filters): Record<string, string> => {
  const params: Record<string, string> = {};
  if (filters.status) params.status = filters.status;
  if (filters.year) params.ano = filters.year;
  if (filters.search) params.busca = filters.search;
  return params;
};

const pageUrl = (page: number, filters: Filters) => {
  const params = new URLSearchParams(toParams(filters));
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/contratos${qs ? `?${qs}` : ""}`;
};

export default function ContractsIndex({ contracts = [], pagination, filters = {}, years = [], statuses = [], stats }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const maxYearCount = stats?.byYear.length ? Math.max(...stats.byYear.map((b) => b.count)) : 0;

  function applyFilters(patch: Partial<Filters>) {
    router.get("/contratos", toParams({ ...filters, ...patch }), { preserveScroll: true });
  }

  const hasFilters = !!(filters.status || filters.year || filters.search);

  return (
    <>
      <SeoHead title="Contratos - Câmara Municipal de Sumé" description="Relação dos contratos da Câmara Municipal de Sumé: contratado, objeto, valor, vigência e fiscal responsável." url="/contratos" />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Contratos" }]} />
        <PageHero badge="Transparência" title="Contratos" subtitle="Relação dos contratos com contratado, objeto, valor, vigência e fiscal responsável" centered />
        <main id="conteudo">
          <section className="py-10 lg:py-14">
            <div className="container">
              {/* Painel de indicadores + evolução por ano */}
              {stats && stats.total > 0 && (
                <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div data-reveal="up" className="card-modern p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileSignature className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-foreground tabular-nums leading-none m-0">{stats.total}</p>
                      <p className="text-sm text-muted-foreground m-0 mt-1">Contratos cadastrados</p>
                    </div>
                  </div>
                  <div data-reveal="up" data-reveal-delay="60" className="card-modern p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-foreground tabular-nums leading-none m-0">{stats.vigentes}</p>
                      <p className="text-sm text-muted-foreground m-0 mt-1">Contratos vigentes</p>
                    </div>
                  </div>
                  <div data-reveal="up" data-reveal-delay="120" className="card-modern p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-foreground tabular-nums leading-none m-0">{fmtCompactMoney(stats.totalValue)}</p>
                      <p className="text-sm text-muted-foreground m-0 mt-1">Valor total contratado</p>
                    </div>
                  </div>
                </div>
              )}

              {stats && stats.byYear.length > 1 && (
                <div data-reveal="up" className="mb-8 card-modern p-5 lg:p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-sky/10 text-sky flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-foreground leading-tight m-0">Contratos por ano</h2>
                      <p className="text-xs text-muted-foreground m-0">Quantidade de contratos firmados em cada exercício</p>
                    </div>
                  </div>
                  <div
                    className="flex items-end justify-between gap-2 sm:gap-4 h-44"
                    role="img"
                    aria-label={`Contratos por ano: ${stats.byYear.map((b) => `${b.year}: ${b.count}`).join(", ")}.`}
                  >
                    {stats.byYear.map((b) => {
                      const h = maxYearCount > 0 ? (b.count / maxYearCount) * 100 : 0;
                      return (
                        <div key={b.year} className="flex-1 h-full flex flex-col items-center justify-end gap-2 min-w-0">
                          <span className="text-xs font-semibold text-foreground tabular-nums">{b.count}</span>
                          <div className="w-full flex-1 flex items-end justify-center">
                            <div
                              className="w-8 sm:w-12 rounded-t-md bg-gradient-to-t from-navy to-sky transition-all"
                              style={{ height: `${Math.max(h, 4)}%` }}
                              title={`${b.year}: ${b.count} contrato(s)`}
                            />
                          </div>
                          <span className="text-[11px] sm:text-xs text-muted-foreground tabular-nums">{b.year}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toolbar de filtros */}
              <FilterBar>
                <form className="filter-search" onSubmit={(e) => { e.preventDefault(); applyFilters({ search: searchTerm }); }}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar por nº, objeto, contratado ou fiscal..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </form>
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
                    onClick={() => { setSearchTerm(""); router.get("/contratos"); }}
                    className="w-full md:w-auto h-11 flex items-center justify-center gap-1.5 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" /> Limpar
                  </button>
                )}</FilterBar>

              {pagination?.total !== undefined && (
                <p data-reveal="fade" className="mb-6 text-sm text-muted-foreground text-right">
                  {pagination.total} {pagination.total === 1 ? "contrato encontrado" : "contratos encontrados"}
                </p>
              )}

              {contracts.length > 0 ? (
                <div className="space-y-4">
                  {contracts.map((c, i) => {
                    const money = fmtMoney(c.value);
                    return (
                      <div key={c.id} data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 60)} className="card-modern p-5 flex flex-col sm:flex-row sm:items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileSignature className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {c.number && <span className="px-2.5 py-0.5 bg-gold/15 text-navy-dark dark:text-gold rounded-full text-xs font-semibold uppercase tracking-wide">Nº {c.number}</span>}
                            {c.year && <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">{c.year}</span>}
                            {c.modality && <span className="px-2.5 py-0.5 bg-sky/10 text-sky rounded-full text-xs font-semibold">{c.modality}</span>}
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClasses(c.status)}`}>{statusLabel(c.status)}</span>
                          </div>
                          <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                            <Link href={`/contratos/${c.slug}`} className="no-underline text-foreground group-hover:text-primary transition-colors">
                              {c.contractorName || c.object || `Contrato nº ${c.number ?? ''}`}
                            </Link>
                          </h3>
                          {c.contractorName && c.object && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{c.object}</p>
                          )}
                          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                            {(c.startDate || c.endDate) && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDocumentDate(c.startDate)}{c.endDate ? ` a ${formatDocumentDate(c.endDate)}` : ''}
                              </span>
                            )}
                            {!c.startDate && !c.endDate && c.term && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />Vigência: {c.term}
                              </span>
                            )}
                            {money && <span className="flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" />{money}</span>}
                            {c.fiscalName && <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" />Fiscal: {c.fiscalName}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/contratos/${c.slug}`}
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
                    <FileSignature className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhum contrato encontrado</h3>
                  <p className="text-muted-foreground text-sm">{hasFilters ? "Tente ajustar os filtros de busca" : "Nenhum contrato cadastrado"}</p>
                </div>
              )}

              {pagination && pagination.lastPage > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  {pagination.currentPage > 1 && (
                    <Link href={pageUrl(pagination.currentPage - 1, filters)} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors no-underline">
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground">Página {pagination.currentPage} de {pagination.lastPage}</span>
                  {pagination.currentPage < pagination.lastPage && (
                    <Link href={pageUrl(pagination.currentPage + 1, filters)} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors no-underline">
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
