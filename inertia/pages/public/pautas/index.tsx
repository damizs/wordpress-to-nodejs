import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, ChevronLeft, ChevronRight, Search, X, ArrowRight } from "lucide-react";

interface Pauta { id: number; title: string; slug: string; date: string; session_type?: string; }
interface Props {
  pautas: Pauta[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  years?: number[];
  filters?: { year?: string; search?: string };
}

export default function PautasIndex({ pautas = [], pagination, years = [], filters = {} }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  function applyFilters(patch: Record<string, string>) {
    const params: Record<string, string> = {};
    const year = patch.ano ?? filters.year ?? "";
    const search = patch.busca ?? filters.search ?? "";
    if (year) params.ano = year;
    if (search) params.busca = search;
    router.get("/pautas", params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.year || filters.search);
  const queryString = `${filters.year ? `&ano=${filters.year}` : ""}${filters.search ? `&busca=${encodeURIComponent(filters.search)}` : ""}`;

  return (
    <>
      <SeoHead title="Pautas - Câmara Municipal de Sumé" description="Confira as pautas das sessões plenárias." url="/pautas" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Pautas" }]} />
        <PageHero badge="Sessões Plenárias" title="Pautas das Sessões" subtitle="Ordem do dia e matérias em discussão nas sessões da Câmara Municipal" />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div data-reveal="up" className="max-w-3xl mx-auto mb-8 card-modern p-4 flex flex-col sm:flex-row gap-3">
              <form className="relative flex-1" onSubmit={(e) => { e.preventDefault(); applyFilters({ busca: searchTerm }); }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar pauta..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </form>
              <select
                value={filters.year || ""}
                onChange={(e) => applyFilters({ ano: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Todos os anos</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {hasFilters && (
                <button onClick={() => { setSearchTerm(""); router.get("/pautas"); }} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                  <X className="w-4 h-4" /> Limpar
                </button>
              )}
            </div>

            {pautas.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-4">
                {pautas.map((pauta, i) => (
                  <Link key={pauta.id} href={`/pautas/${pauta.slug}`} className="group no-underline block" data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 60)}>
                    <div className="card-modern card-shine p-5 flex items-center gap-4 hover-lift">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 icon-pop">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{pauta.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(pauta.date).toLocaleDateString('pt-BR')}</span>
                          {pauta.session_type && <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full text-xs font-medium">{pauta.session_type}</span>}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </Link>
                ))}
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
        </main>
        <Footer />
      </div>
    </>
  );
}
