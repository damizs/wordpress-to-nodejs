import { useRef } from "react";
import { Link } from "@inertiajs/react";
import {
  Activity,
  BadgeCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Gavel,
  TrendingUp,
  Users,
} from "lucide-react";
import { SectionHeading } from "~/components/SectionHeading";

interface LegislativoVereador {
  id: number;
  nome: string;
  cargo: string;
  foto: string | null;
  slug: string;
  materias: number;
}

interface LegislativoMateria {
  id: number;
  titulo: string;
  data: string;
  url: string;
}

interface LegislativoData {
  weekly: { label: string; count: number }[];
  materias: LegislativoMateria[];
  vereadores: LegislativoVereador[];
  totalMateriasAno: number;
  totalSessoesAno: number;
  ano: number;
}

interface LegislativoSectionProps {
  data?: LegislativoData | null;
  title?: string;
  subtitle?: string;
}

/** Converte pontos em um path SVG suave (Catmull-Rom → Bézier) */
function smoothPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const MateriasChart = ({ weekly }: { weekly: { label: string; count: number }[] }) => {
  const W = 920;
  const H = 280;
  const PAD = { l: 40, r: 16, t: 24, b: 34 };

  const max = Math.max(...weekly.map((p) => p.count), 4);
  const niceMax = Math.ceil(max / 2) * 2;
  const xOf = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(weekly.length - 1, 1);
  const yOf = (v: number) => H - PAD.b - (v * (H - PAD.t - PAD.b)) / niceMax;

  const points: [number, number][] = weekly.map((p, i) => [
    Math.round(xOf(i)),
    Math.round(yOf(p.count)),
  ]);
  const line = smoothPath(points);
  const area = `${line} L ${points[points.length - 1][0]},${H - PAD.b} L ${points[0][0]},${H - PAD.b} Z`;

  const yTicks = [0, niceMax / 2, niceMax];
  const labelStep = Math.ceil(weekly.length / 8);
  const peakIndex = weekly.reduce((best, p, i, arr) => (p.count > arr[best].count ? i : best), 0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Gráfico de matérias legislativas apresentadas por semana"
    >
      <defs>
        <linearGradient id="materias-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--sky))" stopOpacity="0.45" />
          <stop offset="55%" stopColor="hsl(var(--navy))" stopOpacity="0.16" />
          <stop offset="100%" stopColor="hsl(var(--navy))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="materias-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--navy))" />
          <stop offset="100%" stopColor="hsl(var(--sky))" />
        </linearGradient>
        <filter id="materias-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grade horizontal */}
      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={yOf(tick)}
            y2={yOf(tick)}
            stroke="hsl(var(--border))"
            strokeDasharray={tick === 0 ? undefined : "4 6"}
          />
          <text
            x={PAD.l - 8}
            y={yOf(tick) + 4}
            textAnchor="end"
            fontSize="11"
            fill="hsl(var(--muted-foreground))"
          >
            {tick}
          </text>
        </g>
      ))}

      {/* Área + linha com leve glow */}
      <path d={area} fill="url(#materias-fill)" />
      <path
        d={line}
        fill="none"
        stroke="url(#materias-stroke)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#materias-glow)"
      />

      {/* Markers nos pontos */}
      {points.map(([x, y], i) => {
        const isPeak = i === peakIndex && weekly[i].count > 0;
        return (
          <g key={`pt-${i}`}>
            {isPeak && (
              <circle cx={x} cy={y} r="7" fill="hsl(var(--gold))" opacity="0.25" />
            )}
            <circle
              cx={x}
              cy={y}
              r={isPeak ? 4.5 : 3}
              fill="hsl(var(--card))"
              stroke={isPeak ? "hsl(var(--gold))" : "hsl(var(--navy))"}
              strokeWidth="2"
            />
          </g>
        );
      })}

      {/* Rótulos do eixo X */}
      {weekly.map((p, i) =>
        i % labelStep === 0 ? (
          <text
            key={i}
            x={xOf(i)}
            y={H - 10}
            textAnchor="middle"
            fontSize="11"
            fill="hsl(var(--muted-foreground))"
          >
            {p.label}
          </text>
        ) : null
      )}

      {/* Colunas invisíveis com tooltip nativo */}
      {weekly.map((p, i) => (
        <rect
          key={`hover-${i}`}
          x={xOf(i) - (W - PAD.l - PAD.r) / weekly.length / 2}
          y={PAD.t}
          width={(W - PAD.l - PAD.r) / weekly.length}
          height={H - PAD.t - PAD.b}
          fill="transparent"
        >
          <title>{`Semana de ${p.label}: ${p.count} matéria(s)`}</title>
        </rect>
      ))}
    </svg>
  );
};

/** Deriva um "tipo" da matéria a partir da primeira palavra do título. */
function tipoDaMateria(titulo: string): string {
  const first = titulo.trim().split(/\s+/)[0] || "";
  const clean = first.replace(/[^\wÀ-ú]/g, "");
  if (clean.length < 3) return "Matéria";
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

export const LegislativoSection = ({ data, title, subtitle }: LegislativoSectionProps) => {
  const vereadoresRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const hasChartData = data.weekly.some((w) => w.count > 0);
  const hasMaterias = data.materias.length > 0;
  if (!hasChartData && !hasMaterias) return null;

  const scrollBy = (ref: React.RefObject<HTMLDivElement>, dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const vereadoresAtivos = data.vereadores.filter((v) => v.materias > 0);
  const showVereadores = vereadoresAtivos.length > 0;

  // Indicador derivado: média de matérias por semana (a partir de data.weekly)
  const mediaSemanal =
    data.weekly.length > 0
      ? Math.round(
          (data.weekly.reduce((sum, w) => sum + w.count, 0) / data.weekly.length) * 10
        ) / 10
      : 0;

  // Indicador derivado: vereadores com produção (materias > 0)
  const numVereadoresAtivos = vereadoresAtivos.length;

  const stats = [
    {
      icon: Gavel,
      value: data.totalSessoesAno,
      label: `Sessões em ${data.ano}`,
    },
    {
      icon: FileText,
      value: data.totalMateriasAno,
      label: `Matérias em ${data.ano}`,
    },
    {
      icon: Activity,
      value: mediaSemanal,
      label: "Média de matérias / semana",
    },
    {
      icon: Users,
      value: numVereadoresAtivos,
      label: "Parlamentares com produção",
    },
  ];

  return (
    <section className="py-14 lg:py-20 px-4 bg-background">
      <div className="container mx-auto">
        {/* Header */}
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

        {/* Painel de destaque dos números — gradiente navy + acentos gold */}
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-navy text-white shadow-[var(--shadow-lg)] p-6 md:p-8 mb-10"
          data-reveal="up"
          data-reveal-delay="80"
        >
          {/* Brilho decorativo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-gold/20 blur-3xl"
          />
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex flex-col">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/15 mb-3">
                    <Icon className="w-5 h-5 text-gold-light" />
                  </span>
                  <span className="text-4xl lg:text-5xl font-bold tracking-tight tabular-nums leading-none">
                    {s.value}
                  </span>
                  <span className="mt-2 text-xs lg:text-sm font-medium text-white/65 leading-snug">
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
          {/* Gráfico — card premium */}
          {hasChartData && (
            <div
              className="card-modern p-5 md:p-7 lg:col-span-3"
              data-reveal="up"
              data-reveal-delay="120"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm md:text-base leading-tight">
                      Matérias por semana
                    </h3>
                    <p className="text-xs text-muted-foreground">Ritmo de produção em {data.ano}</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                  <Activity className="w-3.5 h-3.5" />
                  {mediaSemanal}/sem.
                </span>
              </div>
              <div className="mt-4">
                <MateriasChart weekly={data.weekly} />
              </div>
            </div>
          )}

          {/* Produção por vereador — coluna lateral elegante */}
          {showVereadores && (
            <div
              className="card-modern p-5 md:p-6 lg:col-span-2"
              data-reveal="up"
              data-reveal-delay="160"
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                    <Users className="w-4 h-4 text-primary" />
                  </span>
                  <h3 className="font-semibold text-foreground text-sm md:text-base leading-tight">
                    Produção por vereador
                  </h3>
                </div>
                {vereadoresAtivos.length > 4 && (
                  <div className="hidden sm:flex items-center gap-1">
                    <button
                      onClick={() => scrollBy(vereadoresRef, -1)}
                      aria-label="Anterior"
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollBy(vereadoresRef, 1)}
                      aria-label="Próximo"
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div
                ref={vereadoresRef}
                className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1 [scrollbar-width:thin]"
              >
                {vereadoresAtivos.map((v) => (
                  <Link
                    key={v.id}
                    href={`/vereadores/${v.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 hover:border-primary/30 hover:bg-muted/60 transition-colors no-underline"
                  >
                    {v.foto ? (
                      <img
                        src={v.foto}
                        alt={v.nome}
                        loading="lazy"
                        className="w-11 h-11 rounded-full object-cover border-2 border-border shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center font-bold text-primary shrink-0">
                        {v.nome.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground flex items-center gap-1 truncate">
                        {v.nome}
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{v.cargo}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="block text-lg font-bold leading-none text-primary tabular-nums">
                        {v.materias}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        matéria{v.materias === 1 ? "" : "s"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Últimas matérias — grid de cards com badge de tipo */}
        {hasMaterias && (
          <div className="mt-10" data-reveal="up" data-reveal-delay="200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Últimas matérias</h3>
              <Link
                href="/atividades-legislativas"
                className="text-sm font-semibold text-primary hover:text-gold transition-colors no-underline link-underline"
              >
                Mais matérias
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.materias.map((m) => {
                const tipo = tipoDaMateria(m.titulo);
                const external = m.url.startsWith("http") || m.url.startsWith("/uploads");
                return (
                  <div
                    key={m.id}
                    className="card-modern hover-lift flex flex-col p-5"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                        <FileText className="w-3.5 h-3.5" />
                        {tipo}
                      </span>
                      {m.data && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {m.data}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug line-clamp-3 flex-1">
                      {m.titulo}
                    </p>
                    <a
                      href={m.url}
                      target={external ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-gold transition-colors no-underline self-start"
                    >
                      Acessar matéria
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
