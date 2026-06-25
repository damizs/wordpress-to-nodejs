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
import { LegislativoLineChart } from "~/components/LegislativoLineChart";
import { InfiniteCarousel } from "~/components/InfiniteCarousel";

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
    "group flex flex-col h-full min-h-[180px] bg-card border border-border/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/25 transition-all no-underline";

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

function MateriaTimelineItem({
  m,
  showConnector,
}: {
  m: LegislativoMateria;
  showConnector?: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span
          className="flex h-3 w-3 shrink-0 rounded-full bg-gold ring-4 ring-gold/20"
          aria-hidden
        />
        {showConnector && (
          <span className="hidden sm:block h-px flex-1 bg-border" aria-hidden />
        )}
        {m.data && (
          <time
            dateTime={m.data.split("/").reverse().join("-")}
            className="ml-auto text-[10px] font-bold uppercase tracking-wide text-muted-foreground tabular-nums"
          >
            {m.data}
          </time>
        )}
      </div>
      <MateriaCard m={m} />
    </div>
  );
}

/** Carrossel animado (loop infinito) — últimas matérias legislativas. */
function MateriasTimeline({ materias }: { materias: LegislativoMateria[] }) {
  if (materias.length === 0) return null;

  const items = materias.map((m, i) => (
    <div
      key={m.id}
      role="listitem"
      className="carousel-slide-sm"
    >
      <MateriaTimelineItem m={m} showConnector={i < materias.length - 1} />
    </div>
  ));

  return (
    <div className="relative -mx-1 px-1" role="list" aria-label="Linha do tempo das últimas matérias legislativas">
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent z-10 md:w-12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent z-10 md:w-12"
        aria-hidden
      />

      <InfiniteCarousel
        ariaLabel="Últimas matérias legislativas"
        gapClass="gap-4"
        speed={0.2}
        className="pb-1 pt-2"
      >
        {items}
      </InfiniteCarousel>
    </div>
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
    <section className="section-block bg-background">
      <div className="container min-w-0">
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
              Use a roda do mouse sobre o gráfico para ampliar ou reduzir o período. Arraste
              para navegar ou use a barra de ferramentas para resetar.
            </p>
            <LegislativoLineChart weekly={data.weekly} />
          </div>
        )}

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
            <MateriasTimeline materias={data.materias} />
          </div>
        )}
      </div>
    </section>
  );
};
