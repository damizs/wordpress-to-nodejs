import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, ChevronLeft, ChevronRight, X } from "lucide-react";
import { DownloadPdfButton, formatDocumentDate } from "~/components/DocumentActions";

interface GazetteEntry {
  id: number;
  edition_number: string;
  date: string;
  description?: string | null;
  file_url?: string | null;
}

interface Props {
  entries: GazetteEntry[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  years?: number[];
  filters?: { year?: string };
}

const pageUrl = (page: number, year?: string) => {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (year) params.set("ano", year);
  const qs = params.toString();
  return `/diario-oficial${qs ? `?${qs}` : ""}`;
};

export default function DiarioOficialIndex({ entries = [], pagination, years = [], filters = {} }: Props) {
  return (
    <>
      <SeoHead title="Diário Oficial - Câmara Municipal de Sumé" description="Acesse as edições do Diário Oficial da Câmara Municipal de Sumé." url="/diario-oficial" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Diário Oficial" }]} />
        <PageHero badge="Documentos Oficiais" title="Diário Oficial" subtitle="Edições do Diário Oficial da Câmara Municipal, disponíveis para download em PDF" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              {/* Toolbar de filtros */}
              <div data-reveal="up" className="max-w-4xl mx-auto mb-8 card-modern p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="flex-1 text-sm text-muted-foreground">
                  {pagination?.total !== undefined
                    ? `${pagination.total} ${pagination.total === 1 ? "edição publicada" : "edições publicadas"}`
                    : "Edições publicadas"}
                </p>
                <select
                  value={filters.year || ""}
                  onChange={(e) => router.get("/diario-oficial", e.target.value ? { ano: e.target.value } : {}, { preserveScroll: true })}
                  className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todos os anos</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {filters.year && (
                  <button
                    onClick={() => router.get("/diario-oficial")}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" /> Limpar
                  </button>
                )}
              </div>

              {entries.length > 0 ? (
                <div className="max-w-4xl mx-auto space-y-4">
                  {entries.map((entry, i) => {
                    const year = String(entry.date || "").slice(0, 4);
                    return (
                      <div key={entry.id} data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 60)} className="card-modern p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 bg-gold/10 text-gold rounded-full text-xs font-semibold uppercase tracking-wide">Edição nº {entry.edition_number}</span>
                            {year && <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold">{year}</span>}
                          </div>
                          <h3 className="font-semibold text-foreground leading-snug line-clamp-2">
                            {entry.description || `Diário Oficial — Edição nº ${entry.edition_number}`}
                          </h3>
                          <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <Calendar className="w-3.5 h-3.5" />{formatDocumentDate(entry.date, true)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <DownloadPdfButton fileUrl={entry.file_url} />
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
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma edição encontrada</h3>
                  <p className="text-muted-foreground text-sm">{filters.year ? "Tente outro ano" : "Nenhuma edição publicada ainda"}</p>
                </div>
              )}

              {pagination && pagination.lastPage > 1 && (
                <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 mt-10">
                  {pagination.currentPage > 1 && (
                    <Link
                      href={pageUrl(pagination.currentPage - 1, filters.year)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors no-underline"
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground">Página {pagination.currentPage} de {pagination.lastPage}</span>
                  {pagination.currentPage < pagination.lastPage && (
                    <Link
                      href={pageUrl(pagination.currentPage + 1, filters.year)}
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
