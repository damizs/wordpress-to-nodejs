import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import {
  FileText,
  Download,
  ChevronDown,
  Info,
  FolderOpen,
  Layers,
  X,
  Search,
  Database,
  Code2,
} from "lucide-react";

interface Report {
  id: number;
  reportType: string;
  year: number;
  periodKind: string;
  periodNumber: number | null;
  periodLabel: string;
  title: string | null;
  description: string | null;
  fileUrl: string | null;
  updatedAt: string | null;
}

interface Props {
  reports: Report[];
  filters: { type: string; year: string; search?: string };
  years: number[];
  types: string[];
}

const TYPE_FULL: Record<string, string> = {
  RGF: "Relatório de Gestão Fiscal (RGF)",
  RREO: "Relatório Resumido da Execução Orçamentária (RREO)",
};

export default function FiscalReportsIndex({ reports = [], filters = {}, years = [], types = [] }: Props) {
  const org = (usePage().props as { camara?: { nome?: string } }).camara?.nome || "Câmara Municipal";
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Ramificação: Ano → Tipo → Períodos
  const byYear = useMemo(() => {
    const map = new Map<number, Report[]>();
    for (const r of reports) {
      if (!map.has(r.year)) map.set(r.year, []);
      map.get(r.year)!.push(r);
    }
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [reports]);

  const [open, setOpen] = useState<Set<number>>(() => new Set(byYear.length ? [byYear[0][0]] : []));
  const toggle = (y: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(y)) next.delete(y);
      else next.add(y);
      return next;
    });

  function applyFilters(patch: Record<string, string>) {
    const params: Record<string, string> = {};
    const merged = { ...filters, ...patch };
    if (merged.type) params.tipo = merged.type;
    if (merged.year) params.ano = merged.year;
    if (merged.search) params.busca = merged.search;
    router.get("/relatorios-fiscais", params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.type || filters.year || filters.search);

  function exportData(format: "csv" | "json") {
    const rows = reports.map((r) => ({
      ano: r.year,
      tipo: r.reportType,
      periodo: r.periodLabel,
      periodicidade: r.periodKind,
      numero_periodo: r.periodNumber,
      titulo: r.title || `${r.reportType} ${r.periodLabel} ${r.year}`,
      descricao: r.description || "",
      arquivo: r.fileUrl || "",
      atualizado_em: r.updatedAt || "",
    }));
    const body =
      format === "json"
        ? JSON.stringify(rows, null, 2)
        : [
            ["ano", "tipo", "periodo", "periodicidade", "numero_periodo", "titulo", "descricao", "arquivo", "atualizado_em"].join(";"),
            ...rows.map((row) =>
              Object.values(row)
                .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
                .join(";")
            ),
          ].join("\n");
    const blob = new Blob([format === "csv" ? `\ufeff${body}` : body], {
      type: format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `relatorios-fiscais-${filters.year || "todos"}.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const groupByType = (list: Report[]) => {
    const m = new Map<string, Report[]>();
    for (const r of list) {
      if (!m.has(r.reportType)) m.set(r.reportType, []);
      m.get(r.reportType)!.push(r);
    }
    return Array.from(m.entries());
  };

  return (
    <>
      <SeoHead
        title="Relatórios Fiscais (RGF / RREO)"
        description={`Relatórios de Gestão Fiscal (RGF) e demais relatórios fiscais da ${org}, organizados por ano e período.`}
        url="/relatorios-fiscais"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Transparência", href: "/transparencia" }, { label: "Relatórios Fiscais" }]} />
        <PageHero
          badge="Transparência Ativa"
          title="Relatórios Fiscais"
          subtitle="Relatório de Gestão Fiscal (RGF) e demais relatórios, organizados por ano e período"
          centered
        />

        <main id="conteudo">
          <section className="py-10 lg:py-14">
            <div className="container">
              {/* Nota informativa */}
              <div data-reveal="up" className="mb-8 flex gap-4 rounded-2xl border border-sky/20 bg-sky/5 p-5 lg:p-6">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-sky/15 text-sky flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Sobre os relatórios</p>
                  <p>
                    O <strong className="text-foreground">Relatório de Gestão Fiscal (RGF)</strong> é publicado
                    periodicamente conforme o porte do município (quadrimestral ou semestral), nos termos da{" "}
                    <strong className="text-foreground">Lei de Responsabilidade Fiscal (LC nº 101/2000)</strong>.
                    Selecione o ano para ver os relatórios de cada período.
                  </p>
                </div>
              </div>

              {/* Filtros e dados estruturados */}
              {(years.length > 0 || types.length > 1) && (
                <div data-reveal="up" className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-3">
                    <form
                      className="relative flex-1"
                      onSubmit={(e) => {
                        e.preventDefault();
                        applyFilters({ search: searchTerm });
                      }}
                    >
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por título, descrição, tipo ou período..."
                        className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </form>
                    {types.length > 1 && (
                      <select
                        value={filters.type || ""}
                        onChange={(e) => applyFilters({ type: e.target.value })}
                        aria-label="Tipo de relatório"
                        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-48"
                      >
                        <option value="">Todos os tipos</option>
                        {types.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    )}
                    {years.length > 0 && (
                      <select
                        value={filters.year || ""}
                        onChange={(e) => applyFilters({ year: e.target.value })}
                        aria-label="Ano"
                        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-44"
                      >
                        <option value="">Todos os anos</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    )}
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          router.get("/relatorios-fiscais");
                        }}
                        className="h-11 w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:w-auto"
                      >
                        <X className="w-4 h-4" /> Limpar
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-muted-foreground">
                      {reports.length} {reports.length === 1 ? "registro estruturado" : "registros estruturados"}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Exportar dados:</span>
                      <button type="button" onClick={() => exportData("csv")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                        <Database className="h-4 w-4 text-emerald-600" /> CSV
                      </button>
                      <button type="button" onClick={() => exportData("json")} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                        <Code2 className="h-4 w-4 text-sky" /> JSON
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Árvore: Ano → Tipo → Períodos */}
              {byYear.length > 0 ? (
                <div className="space-y-4">
                  {byYear.map(([year, list]) => {
                    const isOpen = open.has(year);
                    const grupos = groupByType(list);
                    return (
                      <div
                        key={year}
                        data-reveal="up"
                        className="rounded-2xl bg-card border border-border/60 shadow-sm overflow-hidden"
                      >
                        {/* Cabeçalho do ano (galho principal) */}
                        <button
                          type="button"
                          onClick={() => toggle(year)}
                          aria-expanded={isOpen}
                          className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                        >
                          <div className="w-11 h-11 rounded-xl bg-gradient-hero flex items-center justify-center shrink-0 text-primary-foreground">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-foreground leading-tight m-0 tabular-nums">{year}</h2>
                            <p className="text-xs text-muted-foreground m-0">
                              {list.length} relatório{list.length === 1 ? "" : "s"}
                            </p>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        {/* Conteúdo do ano */}
                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 space-y-6">
                            {grupos.map(([tipo, itens]) => (
                              <div key={tipo}>
                                <div className="flex items-center gap-2 mb-3">
                                  <Layers className="w-4 h-4 text-gold" />
                                  <h3 className="text-sm font-semibold text-foreground m-0">
                                    {TYPE_FULL[tipo] || tipo}
                                  </h3>
                                </div>
                                {/* Galhos: períodos */}
                                <div className="grid sm:grid-cols-2 gap-3 sm:pl-6 sm:border-l-2 sm:border-border/60">
                                  {itens.map((r) => (
                                    <div
                                      key={r.id}
                                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3.5"
                                    >
                                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground leading-tight truncate">
                                          {r.periodLabel}
                                        </p>
                                        {r.title && (
                                          <p className="text-xs text-muted-foreground truncate">{r.title}</p>
                                        )}
                                      </div>
                                      {r.fileUrl ? (
                                        <a
                                          href={r.fileUrl}
                                          download
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Baixar PDF"
                                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy text-primary-foreground text-xs font-medium hover:bg-navy-light transition-colors no-underline shrink-0"
                                        >
                                          <Download className="w-3.5 h-3.5" /> Baixar
                                        </a>
                                      ) : (
                                        <span className="text-xs text-muted-foreground shrink-0">em breve</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div data-reveal="up" className="rounded-2xl border border-dashed border-border bg-card py-16 px-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Nenhum relatório publicado</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasFilters
                      ? "Nenhum relatório para o filtro selecionado."
                      : "Os relatórios fiscais ainda não foram publicados."}
                  </p>
                </div>
              )}

              <p className="mt-6 text-xs text-muted-foreground/80 leading-relaxed text-center">
                Publicado em cumprimento à Lei de Responsabilidade Fiscal (LC nº 101/2000) e à Lei de Acesso à
                Informação (Lei nº 12.527/2011).
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
