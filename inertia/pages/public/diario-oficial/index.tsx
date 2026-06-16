import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { FileText, ChevronLeft, ChevronRight, Search, Download, ArrowRight } from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";

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
  filters?: { year?: string; search?: string };
}

const pageUrl = (page: number, year?: string, search?: string) => {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (year) params.set("ano", year);
  if (search) params.set("busca", search);
  const qs = params.toString();
  return `/diario-oficial${qs ? `?${qs}` : ""}`;
};

/** Janela de números de página no estilo do plugin: 1 … atual±2 … última */
const pageWindow = (current: number, last: number): (number | "...")[] => {
  const range = 2;
  const out: (number | "...")[] = [];
  let dotsStart = false;
  let dotsEnd = false;
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || (i >= current - range && i <= current + range)) {
      out.push(i);
    } else if (i < current && !dotsStart) {
      dotsStart = true;
      out.push("...");
    } else if (i > current && !dotsEnd) {
      dotsEnd = true;
      out.push("...");
    }
  }
  return out;
};

export default function DiarioOficialIndex({ entries = [], pagination, years = [], filters = {} }: Props) {
  const [busca, setBusca] = useState(filters.search || "");

  const titulo = (e: GazetteEntry) =>
    e.description || `Diário Oficial — Edição nº ${e.edition_number}`;

  // Busca server-side: submete o termo ao controller (whereILike em
  // description/edition_number), preservando o filtro de ano. A paginação e o
  // contador refletem o total real do resultado filtrado.
  const submitBusca = () => {
    const params: Record<string, string | number> = { page: 1 };
    if (filters.year) params.ano = filters.year;
    if (busca.trim()) params.busca = busca.trim();
    router.get("/diario-oficial", params, { preserveState: true });
  };

  const total = pagination?.total ?? entries.length;
  const current = pagination?.currentPage ?? 1;
  const last = pagination?.lastPage ?? 1;
  const perPage = 20;
  const inicio = total === 0 ? 0 : (current - 1) * perPage + 1;
  const fim = Math.min(current * perPage, total);

  return (
    <>
      <SeoHead title="Diário Oficial - Câmara Municipal de Sumé" description="Acesse as edições do Diário Oficial da Câmara Municipal de Sumé." url="/diario-oficial" />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Diário Oficial" }]} />
        <PageHero badge="Documentos Oficiais" title="Diário Oficial" subtitle="Edições do Diário Oficial da Câmara Municipal, disponíveis para download em PDF" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              {/* Filtro por ano (server-side, controller) */}
              <div data-reveal="up" className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
                <p className="md:flex-1 text-sm text-muted-foreground">
                  Filtre as edições por ano de publicação
                </p>
                <select
                  value={filters.year || ""}
                  onChange={(e) => {
                    const params: Record<string, string | number> = { page: 1 };
                    if (e.target.value) params.ano = e.target.value;
                    if (busca.trim()) params.busca = busca.trim();
                    router.get("/diario-oficial", params, { preserveScroll: true });
                  }}
                  className="w-full md:w-auto h-11 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todos os anos</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Card no estilo do plugin */}
              <div data-reveal="up" className="rounded-2xl overflow-hidden shadow-xl bg-card border border-border/60">
                {/* Cabeçalho colorido + contador */}
                <div className="bg-gradient-hero px-6 py-5 flex items-center justify-between gap-4 text-primary-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold m-0">Diário Oficial</h2>
                  </div>
                  <span className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/20 whitespace-nowrap">
                    {total.toLocaleString("pt-BR")} {total === 1 ? "publicação" : "publicações"}
                  </span>
                </div>

                {/* Busca server-side (submete no Enter/submit) */}
                <div className="px-6 py-4 border-b border-border/60">
                  <form
                    className="relative max-w-md"
                    onSubmit={(e) => { e.preventDefault(); submitBusca(); }}
                  >
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                    <input
                      type="search"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar publicação..."
                      className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 transition-colors"
                    />
                  </form>
                </div>

                {/* Lista */}
                {entries.length > 0 ? (
                  <>
                    <div className="divide-y divide-border/60">
                      {entries.map((entry) => {
                        const dataFmt = formatDocumentDate(entry.date) || String(entry.date || "");
                        const Row = ({ children }: { children: React.ReactNode }) =>
                          entry.file_url ? (
                            <a
                              href={entry.file_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Baixar PDF"
                              className="flex items-center gap-4 px-6 py-4 no-underline hover:bg-muted/60 transition-colors group"
                            >
                              {children}
                            </a>
                          ) : (
                            <div className="flex items-center gap-4 px-6 py-4 group">{children}</div>
                          );

                        return (
                          <Row key={entry.id}>
                            <span className="text-sm font-medium text-muted-foreground shrink-0 w-24">{dataFmt}</span>
                            <span className="text-sm text-foreground flex-1 truncate group-hover:text-primary transition-colors">
                              {titulo(entry)}
                            </span>
                            <span className="hidden sm:inline px-2.5 py-0.5 bg-gold/15 text-navy-dark dark:text-gold rounded-full text-[11px] font-semibold uppercase tracking-wide shrink-0 group-hover:opacity-0 transition-opacity">
                              Nº {entry.edition_number}
                            </span>
                            {entry.file_url ? (
                              <Download className="w-4 h-4 text-muted-foreground/40 shrink-0 opacity-0 -ml-4 group-hover:opacity-100 group-hover:text-primary group-hover:ml-0 transition-all" />
                            ) : (
                              <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                            )}
                          </Row>
                        );
                      })}
                    </div>

                    {/* Paginação (server-side, controller) — preserva ano e busca */}
                    {last > 1 && (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-muted/40 border-t border-border/60">
                        <p className="text-xs text-muted-foreground m-0">
                          Mostrando <span className="font-medium text-foreground">{inicio}</span>-
                          <span className="font-medium text-foreground">{fim}</span> de{" "}
                          <span className="font-medium text-foreground">{total.toLocaleString("pt-BR")}</span>
                        </p>
                        <div className="flex items-center gap-1">
                          {current > 1 ? (
                            <Link
                              href={pageUrl(current - 1, filters.year, filters.search)}
                              aria-label="Página anterior"
                              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-colors no-underline"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Link>
                          ) : (
                            <span className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground/40">
                              <ChevronLeft className="w-4 h-4" />
                            </span>
                          )}

                          <div className="flex items-center gap-0.5 mx-1">
                            {pageWindow(current, last).map((p, i) =>
                              p === "..." ? (
                                <span key={`dots-${i}`} className="px-1.5 text-muted-foreground/60 text-sm select-none">…</span>
                              ) : p === current ? (
                                <span
                                  key={p}
                                  className="flex items-center justify-center min-w-9 h-9 px-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                                >
                                  {p}
                                </span>
                              ) : (
                                <Link
                                  key={p}
                                  href={pageUrl(p, filters.year, filters.search)}
                                  className="flex items-center justify-center min-w-9 h-9 px-2 rounded-lg text-muted-foreground text-sm font-medium hover:bg-card hover:border-border border border-transparent hover:text-foreground transition-colors no-underline"
                                >
                                  {p}
                                </Link>
                              )
                            )}
                          </div>

                          {current < last ? (
                            <Link
                              href={pageUrl(current + 1, filters.year, filters.search)}
                              aria-label="Próxima página"
                              className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-colors no-underline"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          ) : (
                            <span className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground/40">
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Estado vazio */
                  <div className="px-6 py-14 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Nenhuma publicação encontrada.</p>
                    {filters.search ? (
                      <button
                        onClick={() => {
                          setBusca("");
                          router.get("/diario-oficial", filters.year ? { ano: filters.year } : {}, { preserveScroll: true });
                        }}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Limpar busca
                      </button>
                    ) : filters.year ? (
                      <button
                        onClick={() => router.get("/diario-oficial")}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Ver todos os anos
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
