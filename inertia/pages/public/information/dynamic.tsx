import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { LinkModal } from "~/components/LinkModal";
import { SafeHtml } from "~/components/SafeHtml";
import {
  FileText,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Eye,
  FolderOpen,
  Database,
  Code2,
  Layers,
  ChevronDown,
} from "lucide-react";

interface InfoRecord {
  id: number;
  title: string;
  year: number;
  content?: string | null;
  reference_date?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  file_url?: string | null;
  open_mode?: string | null;
  hide_chrome?: boolean | null;
}

interface Category { id: number; name: string; slug: string; }

interface Props {
  records: {
    data: InfoRecord[];
    meta?: { currentPage?: number; current_page?: number; lastPage?: number; last_page?: number; total?: number };
  };
  category: Category;
  allCategories?: Category[];
  years?: number[];
  filters?: { year?: string; search?: string };
  latestUpdate?: string | null;
}

export default function DynamicInfoPage({ records, category, allCategories = [], years = [], filters = {}, latestUpdate: latestUpdateFromServer = null }: Props) {
  const items = records?.data || [];
  const meta = records?.meta;
  const currentPage = meta?.currentPage || meta?.current_page || 1;
  const lastPage = meta?.lastPage || meta?.last_page || 1;
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [modalRecord, setModalRecord] = useState<InfoRecord | null>(null);
  const [collapsedYears, setCollapsedYears] = useState<Record<number, boolean>>({});

  function applyFilters(patch: Record<string, string>) {
    const params: Record<string, string> = {};
    const year = patch.ano ?? filters.year ?? "";
    const search = patch.busca ?? filters.search ?? "";
    if (year) params.ano = year;
    if (search) params.busca = search;
    router.get(`/${category.slug}`, params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.year || filters.search);
  const queryString = `${filters.year ? `&ano=${filters.year}` : ""}${filters.search ? `&busca=${encodeURIComponent(filters.search)}` : ""}`;

  const normalizeTitle = (title: string, year: number) =>
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(new RegExp(`\\b${year}\\b`, "g"), "")
      .replace(/[^\w]+/g, " ")
      .trim();

  const hasUsefulContent = (record: InfoRecord) =>
    !!(record.file_url || record.content?.trim() || record.reference_date);

  const visibleItems = items.filter((record) => {
    if (hasUsefulContent(record)) return true;

    const key = normalizeTitle(record.title, record.year);
    return !items.some(
      (candidate) =>
        candidate.id !== record.id &&
        candidate.year === record.year &&
        hasUsefulContent(candidate) &&
        normalizeTitle(candidate.title, candidate.year) === key
    );
  });
  const total = visibleItems.length;
  const latestUpdate = (latestUpdateFromServer ? [latestUpdateFromServer] : visibleItems
    .map((record) => record.reference_date || record.updated_at || record.created_at))
    .filter(Boolean)
    .map((value) => new Date(value as string))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const latestUpdateLabel = latestUpdate ? latestUpdate.toLocaleDateString("pt-BR") : null;

  function exportData(format: "csv" | "json") {
    const rows = visibleItems.map((record) => ({
      titulo: record.title,
      ano: record.year,
      data: record.reference_date ? new Date(record.reference_date).toLocaleDateString("pt-BR") : "",
      arquivo: record.file_url || "",
      conteudo: record.content?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "",
    }));

    const body =
      format === "json"
        ? JSON.stringify(rows, null, 2)
        : [
            ["titulo", "ano", "data", "arquivo", "conteudo"].join(";"),
            ...rows.map((row) =>
              [row.titulo, row.ano, row.data, row.arquivo, row.conteudo]
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(";")
            ),
          ].join("\n");

    const blob = new Blob([format === "csv" ? `\ufeff${body}` : body], {
      type: format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${category.slug}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  // Agrupa por ano para leitura mais fácil (como o cidadão espera encontrar)
  const groupedByYear = visibleItems.reduce<Record<number, InfoRecord[]>>((acc, record) => {
    (acc[record.year] ||= []).push(record);
    return acc;
  }, {});
  const sortedYears = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

  return (
    <>
      <SeoHead title={`${category.name} - Câmara Municipal de Sumé`} url={`/${category.slug}`} />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Acesso à Informação" }, { label: category.name }]} />
        <PageHero badge="Acesso à Informação" title={category.name} subtitle="Documentos publicados em cumprimento à Lei de Acesso à Informação" />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            <div data-reveal="up" className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-col gap-4 bg-navy px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <FolderOpen className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      Acesso à Informação
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="h-4 w-4 text-gold" aria-hidden="true" />
                      Atualizado em: {latestUpdateLabel || "não informado"}
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
                  <Layers className="h-4 w-4 text-gold" aria-hidden="true" />
                  {total} {total === 1 ? "registro encontrado" : "registros encontrados"}
                </div>
              </div>

              <div className="p-5">
                <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Ano
                    </span>
                    <select
                      value={filters.year || ""}
                      onChange={(e) => applyFilters({ ano: e.target.value })}
                      className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Todos</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </label>

                  <form className="block" onSubmit={(e) => { e.preventDefault(); applyFilters({ busca: searchTerm }); }}>
                    <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Buscar
                    </span>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquisar nesta seção..."
                        className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-4 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </form>

                  {hasFilters && (
                    <div className="flex items-end">
                      <button onClick={() => { setSearchTerm(""); router.get(`/${category.slug}`); }} className="inline-flex h-12 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <X className="w-4 h-4" /> Limpar
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Exportar dados:</span>
                    <button type="button" onClick={() => exportData("csv")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                      <Database className="h-4 w-4 text-emerald-600" aria-hidden="true" /> CSV
                    </button>
                    <button type="button" onClick={() => exportData("json")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                      <Code2 className="h-4 w-4 text-sky" aria-hidden="true" /> JSON
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dados exportados conforme os filtros atuais da página.
                  </p>
                </div>
              </div>
            </div>

            {visibleItems.length > 0 ? (
              <div className="space-y-8">
                {sortedYears.map((year) => {
                  const recordsForYear = groupedByYear[year];
                  const collapsed = collapsedYears[year] ?? false;

                  return (
                    <section key={year} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                      <button
                        type="button"
                        onClick={() => setCollapsedYears((prev) => ({ ...prev, [year]: !collapsed }))}
                        className="flex w-full items-center justify-between gap-4 bg-navy px-5 py-5 text-left text-white transition-colors hover:bg-navy-dark"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold">
                            <Calendar className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-bold uppercase tracking-wide sm:text-lg">
                              {category.name} — {year}
                            </h2>
                            <p className="mt-0.5 text-sm text-white/70">
                              {recordsForYear.length} {recordsForYear.length === 1 ? "registro" : "registros"}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </button>

                      {!collapsed && (
                        <div className="space-y-3 bg-background/60 p-4 sm:p-5">
                          {recordsForYear.map((record, i) => (
                            <div key={record.id} data-reveal="up" data-reveal-delay={String(Math.min(i, 5) * 60)} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                                  <FileText className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-foreground">{record.title}</h3>
                                  <p className="mt-0.5 text-sm text-muted-foreground">
                                    Ano: {record.year}
                                    {record.reference_date && " · Data: " + new Date(record.reference_date).toLocaleDateString('pt-BR')}
                                  </p>
                                  {record.content && (
                                    <SafeHtml html={record.content} className="mt-1 line-clamp-2 text-sm text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                              {record.file_url && (
                                <button type="button" onClick={() => setModalRecord(record)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/35 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:text-red-400 dark:hover:text-white sm:min-w-36">
                                  <Eye className="h-4 w-4" aria-hidden="true" />
                                  Visualizar
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum registro encontrado</h3>
                <p className="text-muted-foreground text-sm">{hasFilters ? "Tente ajustar os filtros de busca" : "Em breve novos documentos"}</p>
              </div>
            )}

            {/* Paginação */}
            {lastPage > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                {currentPage > 1 && (
                  <Link href={`/${category.slug}?page=${currentPage - 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">Página {currentPage} de {lastPage}</span>
                {currentPage < lastPage && (
                  <Link href={`/${category.slug}?page=${currentPage + 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}

            {/* Outras categorias */}
            {allCategories.length > 1 && (
              <div className="mt-14 pt-8 border-t border-border">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">Outras informações</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {allCategories
                    .filter((c) => c.slug !== category.slug)
                    .map((c) => (
                      <Link key={c.id} href={`/${c.slug}`} className="px-4 py-2 rounded-xl bg-muted text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors no-underline">
                        {c.name}
                      </Link>
                    ))}
                </div>
              </div>
            )}
            </div>
          </section>
        </main>
        <Footer />
        <LinkModal
          link={
            modalRecord && modalRecord.file_url
              ? {
                  title: modalRecord.title,
                  url: modalRecord.file_url,
                  open_mode: modalRecord.open_mode,
                  hide_chrome: modalRecord.hide_chrome,
                }
              : null
          }
          onClose={() => setModalRecord(null)}
        />
      </div>
    </>
  );
}
