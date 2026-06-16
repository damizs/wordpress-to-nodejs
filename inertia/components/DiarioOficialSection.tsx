import { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { FileText, Download, CalendarDays, Clock, ChevronLeft, ChevronRight, Search, ArrowRight, X } from "lucide-react";
import { SectionHeading } from "~/components/SectionHeading";

interface GazetteEntry {
  id: number;
  editionNumber: string;
  publicationDate: string;
  description: string | null;
  fileUrl: string | null;
}

interface GazetteDate {
  date: string; // "YYYY-MM-DD"
  editionNumber: string;
  fileUrl: string | null;
}

interface DiarioOficialSectionProps {
  latestGazette?: GazetteEntry | null;
  /** Edições/matérias recentes para o módulo "Últimas Publicações" (busca + filtro + paginação). */
  entries?: GazetteEntry[];
  gazetteDates?: GazetteDate[];
  title?: string;
  subtitle?: string;
}

/** Normaliza para comparação sem acento e caixa alta. */
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

/**
 * Deriva o "tipo" da publicação a partir do título (o diário não guarda tipo
 * estruturado). Pega o termo-chave que aparece MAIS À ESQUERDA do texto, que
 * costuma ser o tipo do ato (EXTRATO, PORTARIA, RESOLUÇÃO...). Cai em "Outros".
 */
const TYPE_KEYWORDS: { kw: string; label: string }[] = [
  { kw: "EXTRATO", label: "Extrato" },
  { kw: "ADJUDICACAO", label: "Adjudicação" },
  { kw: "HOMOLOGACAO", label: "Homologação" },
  { kw: "PORTARIA", label: "Portaria" },
  { kw: "RESOLUCAO", label: "Resolução" },
  { kw: "DECRETO", label: "Decreto" },
  { kw: "EDITAL", label: "Edital" },
  { kw: "AVISO", label: "Aviso" },
  { kw: "TERMO ADITIVO", label: "Termo Aditivo" },
  { kw: "DISPENSA", label: "Dispensa" },
  { kw: "INEXIGIBILIDADE", label: "Inexigibilidade" },
  { kw: "CONVENIO", label: "Convênio" },
  { kw: "CONVOCACAO", label: "Convocação" },
  { kw: "BALANCETE", label: "Balancete" },
  { kw: "ERRATA", label: "Errata" },
  { kw: "CONTRATO", label: "Contrato" },
  { kw: "ATA", label: "Ata" },
  { kw: "LEI", label: "Lei" },
];

function deriveType(desc: string | null): string {
  if (!desc) return "Outros";
  const n = normalize(desc);
  let best: string | null = null;
  let bestIdx = Number.POSITIVE_INFINITY;
  for (const t of TYPE_KEYWORDS) {
    const i = n.indexOf(t.kw);
    if (i >= 0 && i < bestIdx) {
      bestIdx = i;
      best = t.label;
    }
  }
  return best || "Outros";
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Converte "YYYY-MM-DD" em partes numéricas sem deslocamento de fuso. */
function parseIso(value: string): { y: number; m: number; d: number } | null {
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

function formatLongDate(value: string): string {
  const p = parseIso(value);
  if (!p) return value;
  return new Date(p.y, p.m - 1, p.d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(value: string): string {
  const p = parseIso(value);
  if (!p) return value;
  return `${String(p.d).padStart(2, "0")}/${String(p.m).padStart(2, "0")}/${p.y}`;
}

/** Janela de páginas: 1 … atual±1 … última (compacta para a home). */
function pageWindow(current: number, last: number): (number | "...")[] {
  const range = 1;
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
}

/**
 * Módulo "Últimas Publicações": header com contador, busca, filtro por tipo
 * (derivado do título) e paginação — tudo client-side sobre as edições já
 * carregadas, espelhando o comportamento do plugin do WordPress.
 */
function LatestPublications({ entries }: { entries: GazetteEntry[] }) {
  const PER_PAGE = 10;
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [page, setPage] = useState(1);

  const withType = useMemo(
    () => entries.map((e) => ({ ...e, tipo: deriveType(e.description) })),
    [entries]
  );

  const types = useMemo(
    () => Array.from(new Set(withType.map((e) => e.tipo))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [withType]
  );

  const filtered = useMemo(() => {
    const nq = normalize(q.trim());
    return withType.filter((e) => {
      const okQ =
        !nq ||
        normalize(e.description || "").includes(nq) ||
        normalize(e.editionNumber || "").includes(nq);
      const okT = !tipo || e.tipo === tipo;
      return okQ && okT;
    });
  }, [withType, q, tipo]);

  const total = filtered.length;
  const last = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, last);
  const inicio = total === 0 ? 0 : (current - 1) * PER_PAGE + 1;
  const fim = Math.min(current * PER_PAGE, total);
  const slice = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const hasFilters = !!q.trim() || !!tipo;
  const titulo = (e: GazetteEntry) =>
    e.description || `Diário Oficial — Edição nº ${e.editionNumber}`;

  return (
    <div
      data-reveal="up"
      className="mb-6 rounded-2xl overflow-hidden shadow-xl bg-card border border-border/60"
    >
      {/* Cabeçalho + contador */}
      <div className="bg-gradient-hero px-6 py-5 flex items-center justify-between gap-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold m-0">Últimas Publicações</h3>
        </div>
        <span className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/20 whitespace-nowrap">
          {entries.length.toLocaleString("pt-BR")} {entries.length === 1 ? "publicação" : "publicações"}
        </span>
      </div>

      {/* Controles: busca + tipo + limpar */}
      <div className="px-6 py-4 border-b border-border/60 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar publicação..."
            aria-label="Buscar publicação"
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 transition-colors"
          />
        </div>
        <select
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setPage(1);
          }}
          aria-label="Filtrar por tipo"
          className="h-11 px-4 rounded-lg bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10 transition-colors cursor-pointer"
        >
          <option value="">Todos os tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setTipo("");
              setPage(1);
            }}
            className="h-11 px-4 inline-flex items-center justify-center gap-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" /> Limpar
          </button>
        )}
      </div>

      {/* Lista */}
      {slice.length > 0 ? (
        <>
          <div className="divide-y divide-border/60">
            {slice.map((entry) => {
              const dataFmt = formatShortDate(entry.publicationDate);
              const inner = (
                <>
                  <span className="text-sm font-medium text-muted-foreground shrink-0 w-24">{dataFmt}</span>
                  <span className="text-sm text-foreground flex-1 truncate group-hover:text-primary transition-colors">
                    {titulo(entry)}
                  </span>
                  <span className="hidden sm:inline px-2.5 py-0.5 bg-sky/10 text-sky rounded-full text-[11px] font-semibold uppercase tracking-wide shrink-0">
                    {entry.tipo}
                  </span>
                  {entry.fileUrl ? (
                    <Download className="w-4 h-4 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  )}
                </>
              );
              return entry.fileUrl ? (
                <a
                  key={entry.id}
                  href={entry.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Baixar PDF"
                  className="flex items-center gap-4 px-6 py-4 no-underline hover:bg-muted/60 transition-colors group"
                >
                  {inner}
                </a>
              ) : (
                <Link
                  key={entry.id}
                  href="/diario-oficial"
                  className="flex items-center gap-4 px-6 py-4 no-underline hover:bg-muted/60 transition-colors group"
                >
                  {inner}
                </Link>
              );
            })}
          </div>

          {/* Paginação client-side + atalho para a página completa */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-muted/40 border-t border-border/60">
            <p className="text-xs text-muted-foreground m-0">
              Mostrando <span className="font-medium text-foreground">{inicio}</span>-
              <span className="font-medium text-foreground">{fim}</span> de{" "}
              <span className="font-medium text-foreground">{total.toLocaleString("pt-BR")}</span>
            </p>
            {last > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={current <= 1}
                  aria-label="Página anterior"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground enabled:hover:border-primary enabled:hover:text-primary disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-0.5 mx-1">
                  {pageWindow(current, last).map((p, i) =>
                    p === "..." ? (
                      <span key={`d-${i}`} className="px-1.5 text-muted-foreground/60 text-sm select-none">…</span>
                    ) : p === current ? (
                      <span
                        key={p}
                        className="flex items-center justify-center min-w-9 h-9 px-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                      >
                        {p}
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPage(p)}
                        className="flex items-center justify-center min-w-9 h-9 px-2 rounded-lg text-muted-foreground text-sm font-medium hover:bg-card hover:text-foreground border border-transparent hover:border-border transition-colors"
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(last, p + 1))}
                  disabled={current >= last}
                  aria-label="Próxima página"
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground enabled:hover:border-primary enabled:hover:text-primary disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">Nenhuma publicação encontrada.</p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setTipo("");
                setPage(1);
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export const DiarioOficialSection = ({
  latestGazette = null,
  entries = [],
  gazetteDates = [],
  title = "Diário Oficial",
  subtitle,
}: DiarioOficialSectionProps) => {
  // Mês exibido no calendário: começa no mês da última edição (ou no mês atual).
  const initial = useMemo(() => {
    const ref = latestGazette?.publicationDate
      ? parseIso(latestGazette.publicationDate)
      : null;
    const now = new Date();
    return ref
      ? { year: ref.y, month: ref.m - 1 }
      : { year: now.getFullYear(), month: now.getMonth() };
  }, [latestGazette]);

  const [view, setView] = useState(initial);

  // Indexa edições por data ISO para marcar/abrir dias no calendário.
  const byDate = useMemo(() => {
    const map = new Map<string, GazetteDate>();
    for (const g of gazetteDates) {
      const p = parseIso(g.date);
      if (p) map.set(`${p.y}-${p.m}-${p.d}`, g);
    }
    return map;
  }, [gazetteDates]);

  if (!latestGazette && gazetteDates.length === 0 && entries.length === 0) return null;

  const today = new Date();
  const firstWeekday = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrev = () =>
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  const goNext = () =>
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));

  return (
    <section className="py-14 lg:py-20 bg-muted/40">
      <div className="container max-w-5xl">
        <SectionHeading
          badge="Diário Oficial"
          title={title}
          subtitle={subtitle || "Edições oficiais do município, com download e calendário de publicações"}
        />

        {/* Módulo 1: Últimas Publicações (lista com busca, filtro e paginação) */}
        {entries.length > 0 && <LatestPublications entries={entries} />}

        {/* Módulo 2: edição atual + calendário */}
        <div data-reveal className="rounded-2xl overflow-hidden shadow-xl bg-card border border-border/60 grid md:grid-cols-[1fr_300px]">
          {/* Coluna de informação + ações */}
          <div className="p-6 md:p-8 flex flex-col justify-center gap-7">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center shrink-0 shadow-md">
                <FileText className="w-6 h-6 text-primary-foreground" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                {latestGazette && (
                  <p className="text-xs text-muted-foreground capitalize">
                    {formatLongDate(latestGazette.publicationDate)}
                  </p>
                )}
                <h3 className="text-lg font-bold text-foreground leading-tight mt-0.5">
                  Diário Oficial do Município
                </h3>
                {latestGazette && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    Última edição
                    {latestGazette.editionNumber ? ` nº ${latestGazette.editionNumber}` : ""} —{" "}
                    {formatShortDate(latestGazette.publicationDate)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {latestGazette?.fileUrl && (
                <a
                  href={latestGazette.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:bg-primary/90 transition-all no-underline"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  Baixar Última Edição
                </a>
              )}
              <Link
                href="/diario-oficial"
                className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl text-muted-foreground text-sm font-medium hover:bg-muted hover:text-primary transition-colors no-underline"
              >
                <Clock className="w-4 h-4" aria-hidden="true" />
                Ver todas as edições anteriores
              </Link>
            </div>
          </div>

          {/* Calendário (painel navy) */}
          <div className="bg-gradient-hero text-primary-foreground p-5">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Mês anterior"
                className="w-7 h-7 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <div className="text-center leading-tight">
                <div className="text-sm font-semibold">{MONTHS[view.month]}</div>
                <div className="text-[11px] text-primary-foreground/70">{view.year}</div>
              </div>
              <button
                type="button"
                onClick={goNext}
                aria-label="Próximo mês"
                className="w-7 h-7 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1.5">
              {WEEKDAYS.map((w, i) => (
                <span key={i} className="text-[10px] text-center text-primary-foreground/50 py-1">
                  {w}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <span key={i} />;
                const entry = byDate.get(`${view.year}-${view.month + 1}-${day}`);
                const isToday =
                  day === today.getDate() &&
                  view.month === today.getMonth() &&
                  view.year === today.getFullYear();

                const base = "aspect-square flex items-center justify-center text-xs rounded-md transition-colors";
                if (entry) {
                  const cls = `${base} bg-white/20 text-primary-foreground font-medium hover:bg-white/35 cursor-pointer`;
                  return entry.fileUrl ? (
                    <a
                      key={i}
                      href={entry.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Edição de ${formatShortDate(entry.date)}`}
                      className={`${cls} no-underline`}
                    >
                      {day}
                    </a>
                  ) : (
                    <Link
                      key={i}
                      href="/diario-oficial"
                      title={`Edição de ${formatShortDate(entry.date)}`}
                      className={`${cls} no-underline`}
                    >
                      {day}
                    </Link>
                  );
                }
                return (
                  <span
                    key={i}
                    className={`${base} ${isToday ? "bg-white text-navy-dark font-semibold" : "text-primary-foreground/65"}`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>

            <p className="text-[10px] text-primary-foreground/60 mt-3 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-white/30 inline-block" />
              Dias com edição publicada
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
