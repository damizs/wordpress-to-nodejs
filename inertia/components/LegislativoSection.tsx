import { useRef } from "react";
import { Link } from "@inertiajs/react";
import {
  BadgeCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Gavel,
  TrendingUp,
} from "lucide-react";

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
  const PAD = { l: 40, r: 16, t: 20, b: 34 };

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

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Gráfico de matérias legislativas apresentadas por semana"
    >
      <defs>
        <linearGradient id="materias-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--navy))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--navy))" stopOpacity="0.02" />
        </linearGradient>
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
            strokeDasharray={tick === 0 ? undefined : "4 4"}
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

      {/* Área + linha */}
      <path d={area} fill="url(#materias-fill)" />
      <path d={line} fill="none" stroke="hsl(var(--navy))" strokeWidth="2.5" strokeLinecap="round" />

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

export const LegislativoSection = ({ data, title, subtitle }: LegislativoSectionProps) => {
  const vereadoresRef = useRef<HTMLDivElement>(null);
  const materiasRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const hasChartData = data.weekly.some((w) => w.count > 0);
  const hasMaterias = data.materias.length > 0;
  if (!hasChartData && !hasMaterias) return null;

  const scrollBy = (ref: React.RefObject<HTMLDivElement>, dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const vereadoresAtivos = data.vereadores.filter((v) => v.materias > 0);
  const showVereadores = vereadoresAtivos.length > 0;

  return (
    <section className="py-14 lg:py-20 px-4 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10" data-reveal="up">
          <div>
            <span className="inline-block px-4 py-1.5 bg-gold/10 text-gold rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
              Legislativo em Números
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              {title || "Atividade Legislativa"}
            </h2>
            {subtitle && <p className="text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
          </div>
          <Link
            href="/atividades-legislativas"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-gold transition-colors no-underline shrink-0"
          >
            Mais matérias <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Resumo do ano */}
        <div className="flex flex-wrap gap-3 mb-10" data-reveal="up" data-reveal-delay="80">
          <div className="flex items-center gap-2.5 bg-card border border-border/60 rounded-xl px-4 py-2.5 shadow-sm">
            <Gavel className="w-4 h-4 text-gold" />
            <span className="text-sm">
              <strong className="text-foreground">{data.totalSessoesAno}</strong>{" "}
              <span className="text-muted-foreground">sessões em {data.ano}</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5 bg-card border border-border/60 rounded-xl px-4 py-2.5 shadow-sm">
            <FileText className="w-4 h-4 text-gold" />
            <span className="text-sm">
              <strong className="text-foreground">{data.totalMateriasAno}</strong>{" "}
              <span className="text-muted-foreground">matérias em {data.ano}</span>
            </span>
          </div>
        </div>

        {/* Produção por vereador */}
        {showVereadores && (
          <div className="relative mb-10" data-reveal="up" data-reveal-delay="120">
            <div
              ref={vereadoresRef}
              className="flex gap-4 overflow-x-auto pb-2 snap-x scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {vereadoresAtivos.map((v) => (
                <Link
                  key={v.id}
                  href={`/vereadores/${v.slug}`}
                  className="snap-start shrink-0 w-72 bg-card rounded-xl border border-border/60 shadow-sm hover:shadow-md hover:border-primary/25 transition-all no-underline overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4">
                    {v.foto ? (
                      <img
                        src={v.foto}
                        alt={v.nome}
                        loading="lazy"
                        className="w-12 h-12 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-primary">
                        {v.nome.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground flex items-center gap-1.5 truncate">
                        {v.nome}
                        <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{v.cargo}</p>
                    </div>
                  </div>
                  <div className="border-t border-border/60 bg-muted/40 px-4 py-2.5 text-center">
                    <span className="text-sm">
                      <strong className="text-foreground">{v.materias}</strong>{" "}
                      <span className="text-muted-foreground text-xs">
                        Matéria{v.materias === 1 ? "" : "s"}
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {vereadoresAtivos.length > 3 && (
              <>
                <button
                  onClick={() => scrollBy(vereadoresRef, -1)}
                  aria-label="Anterior"
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card border border-border shadow-md items-center justify-center hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollBy(vereadoresRef, 1)}
                  aria-label="Próximo"
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card border border-border shadow-md items-center justify-center hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Gráfico */}
        {hasChartData && (
          <div
            className="bg-card rounded-2xl border border-border/60 shadow-sm p-5 md:p-7 mb-10"
            data-reveal="up"
            data-reveal-delay="160"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-gold" />
              <h3 className="font-semibold text-foreground text-sm md:text-base">
                Matérias apresentadas por semana
              </h3>
            </div>
            <MateriasChart weekly={data.weekly} />
          </div>
        )}

        {/* Últimas matérias */}
        {hasMaterias && (
          <div data-reveal="up" data-reveal-delay="200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Últimas matérias</h3>
              <Link
                href="/atividades-legislativas"
                className="text-sm font-semibold text-primary hover:text-gold transition-colors no-underline link-underline"
              >
                Mais matérias
              </Link>
            </div>
            <div className="relative">
              <div
                ref={materiasRef}
                className="overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="relative inline-flex gap-10 px-6 pt-1 min-w-full">
                  {/* Linha do tempo */}
                  <div className="absolute top-[26px] left-0 right-0 h-0.5 bg-primary/25" aria-hidden="true" />
                  {data.materias.map((m) => (
                    <div key={m.id} className="relative flex flex-col items-center w-56 shrink-0 text-center">
                      <div className="w-[52px] h-[52px] rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-sm z-10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-foreground leading-snug line-clamp-2">
                        {m.titulo}
                      </p>
                      {m.data && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {m.data}
                        </p>
                      )}
                      <a
                        href={m.url}
                        target={m.url.startsWith("http") || m.url.startsWith("/uploads") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="mt-2 text-xs font-bold text-primary hover:text-gold underline underline-offset-2 transition-colors"
                      >
                        Acessar matéria
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              {data.materias.length > 3 && (
                <>
                  <button
                    onClick={() => scrollBy(materiasRef, -1)}
                    aria-label="Matérias anteriores"
                    className="hidden md:flex absolute -left-4 top-[26px] -translate-y-1/2 w-9 h-9 rounded-full bg-card border border-border shadow-md items-center justify-center hover:bg-muted transition-colors z-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollBy(materiasRef, 1)}
                    aria-label="Próximas matérias"
                    className="hidden md:flex absolute -right-4 top-[26px] -translate-y-1/2 w-9 h-9 rounded-full bg-card border border-border shadow-md items-center justify-center hover:bg-muted transition-colors z-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
