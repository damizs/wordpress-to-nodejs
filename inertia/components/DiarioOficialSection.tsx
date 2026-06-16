import { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { FileText, Download, CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
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
  gazetteDates?: GazetteDate[];
  title?: string;
  subtitle?: string;
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

export const DiarioOficialSection = ({
  latestGazette = null,
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

  if (!latestGazette && gazetteDates.length === 0) return null;

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
