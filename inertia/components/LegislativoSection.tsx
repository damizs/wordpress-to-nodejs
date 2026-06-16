import { useState } from "react";
import { Link } from "@inertiajs/react";
import {
  Activity,
  ArrowRight,
  Award,
  Calendar,
  ExternalLink,
  FileCheck,
  FilePen,
  FileQuestion,
  FileText,
  Gavel,
  Lightbulb,
  Scale,
  ScrollText,
  ShieldX,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "~/components/SectionHeading";

interface LegislativoMateria {
  id: number;
  titulo: string;
  tipo?: string | null;
  status?: string | null;
  data: string;
  url: string;
}

interface LegislativoData {
  weekly: { label: string; count: number }[];
  materias: LegislativoMateria[];
  vereadores?: unknown[];
  totalMateriasAno: number;
  totalSessoesAno: number;
  ano: number;
}

interface LegislativoSectionProps {
  data?: LegislativoData | null;
  title?: string;
  subtitle?: string;
}

const norm = (s: string | null | undefined) =>
  (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

interface TypeStyle {
  icon: LucideIcon;
  chip: string;
}

const TYPE_STYLES: { match: string[]; style: TypeStyle }[] = [
  { match: ["veto"], style: { icon: ShieldX, chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400" } },
  { match: ["projeto de lei", "lei municipal", "lei complementar", "lei ordinaria"], style: { icon: Scale, chip: "bg-primary/10 text-primary" } },
  { match: ["decreto"], style: { icon: ScrollText, chip: "bg-sky/10 text-sky" } },
  { match: ["indicacao"], style: { icon: Lightbulb, chip: "bg-gold/15 text-navy-dark dark:text-gold" } },
  { match: ["requerimento"], style: { icon: FileQuestion, chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400" } },
  { match: ["mocao"], style: { icon: Award, chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" } },
  { match: ["resolucao"], style: { icon: FileCheck, chip: "bg-teal-500/10 text-teal-600 dark:text-teal-400" } },
  { match: ["emenda"], style: { icon: FilePen, chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400" } },
];
const DEFAULT_TYPE_STYLE: TypeStyle = { icon: FileText, chip: "bg-primary/10 text-primary" };

function typeStyle(tipo: string | null | undefined): TypeStyle {
  const n = norm(tipo);
  if (!n) return DEFAULT_TYPE_STYLE;
  for (const t of TYPE_STYLES) {
    if (t.match.some((m) => n.includes(norm(m)))) return t.style;
  }
  return DEFAULT_TYPE_STYLE;
}

function statusChipClass(status: string | null | undefined): string {
  const s = norm(status);
  if (!s) return "";
  if (s.includes("aprovad") || s.includes("sancion"))
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (s.includes("tramita")) return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  if (s.includes("rejeit") || s.includes("vetad")) return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
  return "bg-muted text-muted-foreground";
}

/** Gráfico de barras — últimas 12 semanas, tooltip visível no hover. */
function WeeklyBarChart({ weekly }: { weekly: { label: string; count: number }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const data = weekly.slice(-12);
  const max = Math.max(...data.map((w) => w.count), 1);

  return (
    <div className="relative pt-2">
      {/* Tooltip flutuante */}
      {active !== null && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-center shadow-lg"
          style={{
            left: `${((active + 0.5) / data.length) * 100}%`,
            top: 0,
          }}
        >
          <p className="text-xs font-semibold text-foreground capitalize">{data[active].label}</p>
          <p className="text-lg font-bold text-primary tabular-nums">{data[active].count}</p>
          <p className="text-[10px] text-muted-foreground">
            matéria{data[active].count === 1 ? "" : "s"}
          </p>
        </div>
      )}

      <div
        className="flex items-end gap-1.5 sm:gap-2 h-44 md:h-52 mt-8"
        role="img"
        aria-label="Gráfico de matérias apresentadas por semana"
      >
        {data.map((w, i) => {
          const pct = w.count === 0 ? 0 : Math.max(8, (w.count / max) * 100);
          const isActive = active === i;
          return (
            <button
              key={i}
              type="button"
              className="group flex flex-1 flex-col items-center justify-end gap-2 min-w-0 h-full bg-transparent border-0 p-0 cursor-pointer"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`${w.label}: ${w.count} matéria(s)`}
            >
              <div
                className={`w-full max-w-[48px] rounded-t-md transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-t from-navy to-sky shadow-md"
                    : "bg-primary/25 group-hover:bg-primary/45"
                }`}
                style={{ height: `${pct}%` }}
              />
            </button>
          );
        })}
      </div>

      {/* Eixo X — rótulos espaçados */}
      <div className="flex gap-1.5 sm:gap-2 mt-2 border-t border-border pt-2">
        {data.map((w, i) => (
          <div key={i} className="flex-1 min-w-0 text-center">
            {i % 2 === 0 || i === data.length - 1 ? (
              <span className="block text-[10px] sm:text-xs text-muted-foreground capitalize truncate">
                {w.label}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MateriaCard({ m }: { m: LegislativoMateria }) {
  const st = typeStyle(m.tipo);
  const Icon = st.icon;
  const statusCls = statusChipClass(m.status);
  const external = m.url.startsWith("http") || m.url.startsWith("/uploads");

  const inner = (
    <>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {m.tipo && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${st.chip}`}>
                {m.tipo}
              </span>
            )}
            {m.status && statusCls && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCls}`}>
                {m.status}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-3 group-hover:text-primary transition-colors">
            {m.titulo}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border/60">
        {m.data ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" aria-hidden />
            {m.data}
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:text-gold transition-colors">
          Acessar
          <ArrowRight className="w-3.5 h-3.5" aria-hidden />
        </span>
      </div>
    </>
  );

  const className =
    "group flex flex-col h-full bg-card border border-border/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/25 transition-all no-underline";

  if (external) {
    return (
      <a href={m.url} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={m.url} className={className}>
      {inner}
    </Link>
  );
}

export const LegislativoSection = ({ data, title, subtitle }: LegislativoSectionProps) => {
  if (!data) return null;

  const hasChartData = data.weekly.some((w) => w.count > 0);
  const hasMaterias = data.materias.length > 0;
  if (!hasChartData && !hasMaterias) return null;

  const mediaSemanal =
    data.weekly.length > 0
      ? Math.round(
          (data.weekly.reduce((sum, w) => sum + w.count, 0) / data.weekly.length) * 10
        ) / 10
      : 0;

  return (
    <section className="py-14 lg:py-20 bg-background">
      <div className="container">
        <SectionHeading
          align="left"
          badge="Legislativo em Números"
          title={title || "Atividade Legislativa"}
          subtitle={subtitle}
          action={
            <Link
              href="/atividades-legislativas"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-gold transition-colors no-underline"
            >
              Mais matérias <ExternalLink className="w-4 h-4" />
            </Link>
          }
        />

        {/* Resumo do ano */}
        <div className="flex flex-wrap gap-3 mb-8" data-reveal="up">
          <div className="flex items-center gap-3 bg-card border border-border/60 rounded-xl px-5 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
              <Gavel className="w-[18px] h-[18px] text-gold" />
            </div>
            <div className="leading-none">
              <span className="block text-2xl font-bold text-foreground tabular-nums">
                {data.totalSessoesAno}
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                sessões em {data.ano}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border/60 rounded-xl px-5 py-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
              <FileText className="w-[18px] h-[18px] text-gold" />
            </div>
            <div className="leading-none">
              <span className="block text-2xl font-bold text-foreground tabular-nums">
                {data.totalMateriasAno}
              </span>
              <span className="block text-xs text-muted-foreground mt-1">
                matérias em {data.ano}
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        {hasChartData && (
          <div
            className="bg-card rounded-2xl border border-border/60 shadow-sm p-5 md:p-6 mb-10"
            data-reveal="up"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold" />
                <h3 className="font-semibold text-foreground text-sm md:text-base">
                  Matérias apresentadas por semana
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                <Activity className="w-3.5 h-3.5" />
                média {mediaSemanal}/sem.
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Passe o mouse sobre as barras para ver a quantidade de cada semana (últimas 12 semanas).
            </p>
            <WeeklyBarChart weekly={data.weekly} />
          </div>
        )}

        {/* Últimas matérias — grade alinhada */}
        {hasMaterias && (
          <div data-reveal="up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Últimas matérias</h3>
              <Link
                href="/atividades-legislativas"
                className="text-sm font-semibold text-primary hover:text-gold transition-colors no-underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.materias.map((m) => (
                <MateriaCard key={m.id} m={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
