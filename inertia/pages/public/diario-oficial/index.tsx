import { useState, type ReactNode } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  FileSpreadsheet,
  FileText,
  Search,
  X,
} from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";

interface GazetteEntry {
  id: number;
  edition_number: string;
  date: string;
  description?: string | null;
  file_url?: string | null;
  viewer_url?: string | null;
}

interface Props {
  entries: GazetteEntry[];
  latestEntry?: GazetteEntry | null;
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

function entryTitle(entry: GazetteEntry) {
  return entry.description || `Diário Oficial - Edição nº ${entry.edition_number}`;
}

function PdfPreviewModal({
  entry,
  onClose,
}: {
  entry: GazetteEntry | null;
  onClose: () => void;
}) {
  if (!entry?.file_url) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Fechar visualização"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-foreground sm:text-lg">
                {entryTitle(entry)}
              </h2>
              <p className="text-xs text-muted-foreground">
                Edição {entry.edition_number} - {formatDocumentDate(entry.date) || entry.date}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Documento embebido (PDF/visualizador do GetPublic não bloqueiam iframe) */}
        <div className="min-h-0 flex-1 bg-muted">
          <iframe
            src={entry.file_url}
            title={entryTitle(entry)}
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>

        <footer className="flex flex-col gap-2 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-muted-foreground">
            Documento do Diário Oficial (sistema GetPublic).
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={entry.viewer_url || entry.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir em outra página
            </a>
            <a
              href={entry.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground no-underline shadow-sm transition-colors hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function DiarioOficialIndex({
  entries = [],
  latestEntry = null,
  pagination,
  years = [],
  filters = {},
}: Props) {
  const [busca, setBusca] = useState(filters.search || "");
  const [previewEntry, setPreviewEntry] = useState<GazetteEntry | null>(null);
  const org = (usePage().props as { camara?: { nome?: string } }).camara?.nome || "Câmara Municipal";

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
  const updatedAt = formatDocumentDate(latestEntry?.date, true) || "sem publicações";

  return (
    <>
      <SeoHead
        title="Diário Oficial"
        description={`Acesse as edições do Diário Oficial da ${org}.`}
        url="/diario-oficial"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Diário Oficial" }]} />
        <PageHero
          badge="Documentos Oficiais"
          title="Diário Oficial"
          subtitle="Edições do Diário Oficial da Câmara Municipal, disponíveis para leitura online e download em PDF"
          centered
        />

        <main id="conteudo" tabIndex={-1} role="main">
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                <div className="flex flex-col gap-3 bg-primary px-5 py-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary-foreground/70">
                        Atualizado em
                      </p>
                      <p className="font-bold">{updatedAt}</p>
                    </div>
                  </div>
                  <span className="self-start rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold sm:self-auto">
                    {total.toLocaleString("pt-BR")} {total === 1 ? "registro encontrado" : "registros encontrados"}
                  </span>
                </div>

                <div className="grid gap-4 border-b border-border p-5 md:grid-cols-[180px_1fr] sm:p-6">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Ano
                    </span>
                    <select
                      value={filters.year || ""}
                      onChange={(e) => {
                        const params: Record<string, string | number> = { page: 1 };
                        if (e.target.value) params.ano = e.target.value;
                        if (busca.trim()) params.busca = busca.trim();
                        router.get("/diario-oficial", params, { preserveScroll: true });
                      }}
                      className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="">Todos</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>

                  <form onSubmit={(e) => { e.preventDefault(); submitBusca(); }}>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      Buscar
                    </span>
                    <div className="flex">
                      <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60" />
                        <input
                          type="search"
                          value={busca}
                          onChange={(e) => setBusca(e.target.value)}
                          placeholder="Pesquisar publicação, edição ou data..."
                          className="h-12 w-full rounded-l-xl border border-r-0 border-border bg-background pl-12 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
                      <button
                        type="submit"
                        className="flex h-12 w-14 items-center justify-center rounded-r-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                        aria-label="Buscar"
                      >
                        <Search className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Exportar dados:</span>
                    <a
                      href="/dados-abertos/diario-oficial/csv"
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      CSV
                    </a>
                    <a
                      href="/dados-abertos/diario-oficial/json"
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
                    >
                      <FileJson className="h-4 w-4 text-sky" />
                      JSON
                    </a>
                  </div>
                  {latestEntry?.file_url && (
                    <button
                      type="button"
                      onClick={() => setPreviewEntry(latestEntry)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-bold text-navy-dark transition-colors hover:bg-gold-light"
                    >
                      <Eye className="h-4 w-4" />
                      Ver última edição
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="flex flex-col gap-3 bg-gradient-hero px-5 py-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h2 className="m-0 text-lg font-semibold">Diário Oficial</h2>
                  </div>
                  <span className="self-start rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-medium sm:self-auto">
                    {total.toLocaleString("pt-BR")} {total === 1 ? "publicação" : "publicações"}
                  </span>
                </div>

                {entries.length > 0 ? (
                  <>
                    <div className="divide-y divide-border">
                      {entries.map((entry) => {
                        const date = formatDocumentDate(entry.date) || String(entry.date || "");
                        const rowInner: ReactNode = (
                          <>
                            <span className="w-full text-sm font-medium text-muted-foreground sm:w-28">
                              {date}
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
                              {entryTitle(entry)}
                            </span>
                            <span className="inline-flex shrink-0 rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-dark dark:text-gold">
                              Nº {entry.edition_number}
                            </span>
                          </>
                        );

                        return (
                          <div
                            key={entry.id}
                            className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/50 lg:flex-row lg:items-center sm:px-6"
                          >
                            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                              {rowInner}
                            </div>

                            <div className="flex flex-wrap gap-2 lg:justify-end">
                              {entry.file_url ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewEntry(entry)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Visualizar
                                  </button>
                                  <a
                                    href={entry.file_url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
                                  >
                                    <Download className="h-4 w-4" />
                                    Baixar PDF
                                  </a>
                                </>
                              ) : (
                                <span className="inline-flex items-center rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground">
                                  Sem arquivo
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {last > 1 && (
                      <div className="flex flex-col gap-3 border-t border-border bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="m-0 text-xs text-muted-foreground">
                          Mostrando <span className="font-medium text-foreground">{inicio}</span>-
                          <span className="font-medium text-foreground">{fim}</span> de{" "}
                          <span className="font-medium text-foreground">{total.toLocaleString("pt-BR")}</span>
                        </p>
                        <div className="flex items-center gap-1">
                          {current > 1 ? (
                            <Link
                              href={pageUrl(current - 1, filters.year, filters.search)}
                              aria-label="Página anterior"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground no-underline transition-colors hover:border-primary hover:text-primary"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Link>
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground/40">
                              <ChevronLeft className="h-4 w-4" />
                            </span>
                          )}

                          <div className="mx-1 flex items-center gap-0.5">
                            {pageWindow(current, last).map((page, index) =>
                              page === "..." ? (
                                <span key={`dots-${index}`} className="select-none px-1.5 text-sm text-muted-foreground/60">
                                  ...
                                </span>
                              ) : page === current ? (
                                <span
                                  key={page}
                                  className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-2 text-sm font-medium text-primary-foreground"
                                >
                                  {page}
                                </span>
                              ) : (
                                <Link
                                  key={page}
                                  href={pageUrl(page, filters.year, filters.search)}
                                  className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-transparent px-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:border-border hover:bg-card hover:text-foreground"
                                >
                                  {page}
                                </Link>
                              )
                            )}
                          </div>

                          {current < last ? (
                            <Link
                              href={pageUrl(current + 1, filters.year, filters.search)}
                              aria-label="Próxima página"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground no-underline transition-colors hover:border-primary hover:text-primary"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground/40">
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-6 py-14 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <FileText className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">Nenhuma publicação encontrada.</p>
                    {filters.search ? (
                      <button
                        type="button"
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
                        type="button"
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
        <PdfPreviewModal entry={previewEntry} onClose={() => setPreviewEntry(null)} />
      </div>
    </>
  );
}
