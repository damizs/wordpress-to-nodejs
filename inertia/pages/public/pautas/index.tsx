import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, ChevronLeft, ChevronRight, Search, X, ArrowRight } from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";
import { FilterBar } from "~/components/FilterBar";

interface Pauta { id: number; title: string; slug: string; date: string; session_type?: string; }
interface Props {
  pautas: Pauta[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  years?: number[];
  types?: string[];
  filters?: { year?: string; type?: string; search?: string };
}

const TYPE_LABELS: Record<string, string> = {
  ordinaria: "Ordinária",
  extraordinaria: "Extraordinária",
  solene: "Solene",
  especial: "Especial",
};

export default function PautasIndex({ pautas = [], pagination, years = [], types = [], filters = {} }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  function applyFilters(patch: Record<string, string>) {
    const params: Record<string, string> = {};
    const year = patch.ano ?? filters.year ?? "";
    const type = patch.tipo ?? filters.type ?? "";
    const search = patch.busca ?? filters.search ?? "";
    if (year) params.ano = year;
    if (type) params.tipo = type;
    if (search) params.busca = search;
    router.get("/pautas", params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.year || filters.type || filters.search);
  const queryString = `${filters.year ? `&ano=${filters.year}` : ""}${filters.type ? `&tipo=${filters.type}` : ""}${filters.search ? `&busca=${encodeURIComponent(filters.search)}` : ""}`;

  return (
    <>
      <SeoHead title="Pautas - Câmara Municipal de Sumé" description="Confira as pautas das sessões plenárias." url="/pautas" />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Pautas" }]} />
        <PageHero badge="Sessões Plenárias" title="Pautas das Sessões" subtitle="Ordem do dia e matérias em discussão nas sessões da Câmara Municipal" />
        <main>
          <section className="py-10 lg:py-14">
          <div className="container">
            <FilterBar>
              <form className="filter-search" onSubmit={(e) => { e.preventDefault(); applyFilters({ busca: searchTerm }); }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar pauta..."
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </form>
              {types.length > 0 && (
                <select
                  value={filters.type || ""}
                  onChange={(e) => applyFilters({ tipo: e.target.value })}
                  className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todos os tipos</option>
                  {types.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>)}
                </select>
              )}
              <select
                value={filters.year || ""}
                onChange={(e) => applyFilters({ ano: e.target.value })}
                className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Todos os anos</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {hasFilters && (
                <button onClick={() => { setSearchTerm(""); router.get("/pautas"); }} className="w-full md:w-auto h-11 flex items-center justify-center gap-1.5 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X className="w-4 h-4" /> Limpar
                </button>
              )}
            </FilterBar>

            {pautas.length > 0 ? (
              <div className="space-y-4">
                {pautas.map((pauta, i) => {
                  const year = String(pauta.date || "").slice(0, 4);
                  return (
                    <Link key={pauta.id} href={`/pautas/${pauta.slug}`} className="group no-underline block" data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 60)}>
                      <div className="card-modern p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover-lift">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 bg-gold/15 text-navy-dark dark:text-gold rounded-full text-xs font-semibold uppercase tracking-wide">
                              {pauta.session_type ? `Sessão ${pauta.session_type}` : "Pauta de Sessão"}
                            </span>
                            {year && <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">{year}</span>}
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{pauta.title}</h3>
                          <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-3.5 h-3.5" />{formatDocumentDate(pauta.date)}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground group-hover:border-primary/40 group-hover:text-primary transition-colors shrink-0">
                          Ver pauta <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma pauta encontrada</h3>
                <p className="text-muted-foreground text-sm">{hasFilters ? "Tente ajustar os filtros de busca" : "Em breve novas pautas"}</p>
              </div>
            )}

            {pagination && pagination.lastPage > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                {pagination.currentPage > 1 && (
                  <Link href={`/pautas?page=${pagination.currentPage - 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">Página {pagination.currentPage} de {pagination.lastPage}</span>
                {pagination.currentPage < pagination.lastPage && (
                  <Link href={`/pautas?page=${pagination.currentPage + 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors"><ChevronRight className="w-5 h-5" /></Link>
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
