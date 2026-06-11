import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, Download, ChevronLeft, ChevronRight, Search, X, ArrowRight } from "lucide-react";

interface Ata { id: number; title: string; slug: string; date: string; file_url?: string; }
interface Props {
  atas: Ata[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  years?: number[];
  filters?: { year?: string; search?: string };
}

export default function AtasIndex({ atas = [], pagination, years = [], filters = {} }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  function applyFilters(patch: Record<string, string>) {
    const params: Record<string, string> = {};
    const year = patch.ano ?? filters.year ?? "";
    const search = patch.busca ?? filters.search ?? "";
    if (year) params.ano = year;
    if (search) params.busca = search;
    router.get("/atas", params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.year || filters.search);
  const queryString = `${filters.year ? `&ano=${filters.year}` : ""}${filters.search ? `&busca=${encodeURIComponent(filters.search)}` : ""}`;

  return (
    <>
      <SeoHead title="Atas das Sessões - Câmara Municipal de Sumé" description="Acesse as atas das sessões plenárias da Câmara Municipal de Sumé." url="/atas" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atas das Sessões" }]} />
        <PageHero badge="Documentos Oficiais" title="Atas das Sessões" subtitle="Registros oficiais das sessões plenárias realizadas pela Câmara Municipal" />
        <main className="py-12">
          <div className="container mx-auto px-4">
            {/* Toolbar de filtros */}
            <div data-reveal="up" className="max-w-3xl mx-auto mb-8 card-modern p-4 flex flex-col sm:flex-row gap-3">
              <form
                className="relative flex-1"
                onSubmit={(e) => { e.preventDefault(); applyFilters({ busca: searchTerm }); }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar ata..."
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
                <button
                  onClick={() => { setSearchTerm(""); router.get("/atas"); }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" /> Limpar
                </button>
              )}
            </div>

            {pagination?.total !== undefined && (
              <p data-reveal="fade" className="max-w-3xl mx-auto mb-6 text-sm text-muted-foreground text-right">
                {pagination.total} {pagination.total === 1 ? "registro" : "registros"}
              </p>
            )}

            {atas.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-4">
                {atas.map((ata, i) => (
                  <div key={ata.id} data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 60)} className="card-modern card-shine p-5 flex items-center justify-between gap-4 hover-lift group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 icon-pop">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{ata.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5" />{new Date(ata.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/atas/${ata.slug}`} className="hidden sm:inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium no-underline hover:bg-primary/90 transition-colors">
                        Visualizar <ArrowRight className="w-4 h-4" />
                      </Link>
                      {ata.file_url && (
                        <a href={ata.file_url} target="_blank" rel="noopener noreferrer" title="Baixar PDF" className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors no-underline">
                          <Download className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma ata encontrada</h3>
                <p className="text-muted-foreground text-sm">{hasFilters ? "Tente ajustar os filtros de busca" : "Em breve novos documentos"}</p>
              </div>
            )}

            {pagination && pagination.lastPage > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                {pagination.currentPage > 1 && (
                  <Link href={`/atas?page=${pagination.currentPage - 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">Página {pagination.currentPage} de {pagination.lastPage}</span>
                {pagination.currentPage < pagination.lastPage && (
                  <Link href={`/atas?page=${pagination.currentPage + 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors"><ChevronRight className="w-5 h-5" /></Link>
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
