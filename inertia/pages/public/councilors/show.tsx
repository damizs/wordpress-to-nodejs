import { useState } from "react";
import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import {
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  BadgeCheck,
  FileText,
  Users,
  Landmark,
  BookOpen,
  ExternalLink,
  PieChart,
  BarChart3,
} from "lucide-react";

interface Activity {
  id: number;
  slug: string | null;
  title: string;
  summary: string | null;
  date: string | null;
  type: string;
  status: string | null;
  fileUrl: string | null;
}

interface Stats {
  totalMaterias: number;
  totalMateriasPortal: number;
  materiasExercicio: number;
  materiasLegislatura: number;
  exercicioAtual: number;
  legislatura: string | null;
  byType: { type: string; count: number }[];
}

interface Mandato {
  id: number;
  position: string;
  biennium: { name: string | null; isCurrent: boolean } | null;
}

interface Comissao {
  id: number;
  role: string;
  committee: {
    name: string;
    slug: string;
    type: string;
    isActive: boolean;
    legislature: string | null;
  } | null;
}

interface Props {
  vereador: {
    id: number;
    name: string;
    fullName?: string;
    slug: string;
    party?: string;
    photo?: string;
    role?: string;
    email?: string;
    phone?: string;
    biography?: string;
  };
  activities?: Activity[];
  stats?: Stats;
  mandatos?: Mandato[];
  comissoes?: Comissao[];
}

const CHART_COLORS = [
  "hsl(var(--navy))",
  "hsl(var(--gold))",
  "hsl(200 85% 45%)",
  "hsl(160 70% 38%)",
  "hsl(265 60% 55%)",
  "hsl(345 70% 50%)",
  "hsl(25 90% 52%)",
  "hsl(190 65% 40%)",
];

const statusBadge = (status: string | null) => {
  if (!status) return null;
  const s = status.toLowerCase();
  let cls = "bg-muted text-muted-foreground border-border";
  if (s.includes("aprovado") || s.includes("sancionado"))
    cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
  else if (s.includes("tramita"))
    cls = "bg-amber-50 text-amber-700 border-amber-200";
  else if (s.includes("rejeitado") || s.includes("vetado"))
    cls = "bg-red-50 text-red-700 border-red-200";
  else if (s.includes("arquivado")) cls = "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${cls}`}>
      {status}
    </span>
  );
};

/** Barra de progresso com rótulo de percentual */
const StatBar = ({ value, total, label }: { value: number; total: number; label: string }) => {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-700"
          style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

/** Donut SVG com legenda */
const DonutChart = ({ byType }: { byType: { type: string; count: number }[] }) => {
  const total = byType.reduce((acc, t) => acc + t.count, 0);
  if (total === 0) return null;
  const R = 64;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 180 180" className="w-44 h-44 shrink-0" role="img" aria-label="Distribuição percentual das matérias por tipo">
        <circle cx="90" cy="90" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="22" />
        {byType.map((t, i) => {
          const len = (t.count / total) * C;
          const offset = (acc / total) * C;
          acc += t.count;
          return (
            <circle
              key={t.type}
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth="22"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 90 90)"
            >
              <title>{`${t.type}: ${((t.count / total) * 100).toFixed(1)}%`}</title>
            </circle>
          );
        })}
        <text x="90" y="86" textAnchor="middle" fontSize="26" fontWeight="700" fill="hsl(var(--foreground))">
          {total}
        </text>
        <text x="90" y="106" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">
          matérias
        </text>
      </svg>
      <ul className="space-y-2 text-sm w-full">
        {byType.map((t, i) => (
          <li key={t.type} className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span className="text-foreground truncate">{t.type}</span>
            <span className="ml-auto font-semibold text-muted-foreground shrink-0">
              {((t.count / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Barras horizontais por tipo */
const TypeBars = ({ byType }: { byType: { type: string; count: number }[] }) => {
  const max = Math.max(...byType.map((t) => t.count), 1);
  return (
    <div className="space-y-3">
      {byType.map((t, i) => (
        <div key={t.type}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-foreground font-medium truncate">{t.type}</span>
            <span className="text-muted-foreground font-semibold ml-2 shrink-0">{t.count}</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(t.count / max) * 100}%`,
                background: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function VereadorShow({
  vereador,
  activities = [],
  stats,
  mandatos = [],
  comissoes = [],
}: Props) {
  const tabs = [
    { id: "producao", label: "Produção Legislativa", icon: FileText, show: true },
    { id: "comissoes", label: "Comissões", icon: Users, show: comissoes.length > 0 },
    { id: "mandatos", label: "Mandatos", icon: Landmark, show: mandatos.length > 0 },
    { id: "biografia", label: "Biografia", icon: BookOpen, show: !!vereador.biography },
  ].filter((t) => t.show);

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "producao");

  const pctPortal =
    stats && stats.totalMateriasPortal > 0
      ? ((stats.totalMaterias / stats.totalMateriasPortal) * 100).toFixed(1)
      : null;

  return (
    <>
      <SeoHead
        title={`${vereador.name} - Câmara Municipal de Sumé`}
        description={`Perfil e produção legislativa de ${vereador.name}. ${vereador.party || ""}`}
        url={`/vereadores/${vereador.slug}`}
        image={vereador.photo}
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Vereadores", href: "/vereadores" }, { label: vereador.name }]} />

        <main className="py-10">
          <div className="container mx-auto px-4">
            <Link
              href="/vereadores"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para vereadores
            </Link>

            {/* ===== Hero ===== */}
            <div className="card-modern p-6 md:p-8 mb-6" data-reveal="up">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-28 h-36 sm:w-32 sm:h-[10.5rem] rounded-xl overflow-hidden bg-muted shrink-0 shadow-md">
                  {vereador.photo ? (
                    <img src={vereador.photo} alt={vereador.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary/40">
                      {vereador.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                    {vereador.name}
                    <BadgeCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                  </h1>
                  {vereador.fullName && vereador.fullName !== vereador.name && (
                    <p className="text-sm text-muted-foreground mt-0.5">{vereador.fullName}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {vereador.role && (
                      <span className="px-3 py-1 bg-gold/10 text-gold border border-gold/25 text-xs font-bold rounded-full uppercase tracking-wide">
                        {vereador.role}
                      </span>
                    )}
                    {vereador.party && (
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {vereador.party}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5 mt-5">
                    {vereador.email && (
                      <a
                        href={`mailto:${vereador.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm text-foreground hover:border-primary/40 hover:text-primary transition-colors no-underline"
                      >
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="truncate max-w-[240px]">{vereador.email}</span>
                      </a>
                    )}
                    {vereador.phone && (
                      <a
                        href={`tel:${vereador.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm text-foreground hover:border-primary/40 hover:text-primary transition-colors no-underline"
                      >
                        <Phone className="w-4 h-4 text-primary" />
                        {vereador.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Stats ===== */}
            {stats && stats.totalMaterias > 0 && (
              <div className="grid md:grid-cols-2 gap-4 mb-6" data-reveal="up" data-reveal-delay="80">
                <div className="card-modern p-5 md:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Legislatura Atual{stats.legislatura ? ` — ${stats.legislatura}` : ""}
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-3">
                    {stats.materiasLegislatura}
                    <span className="text-sm font-medium text-muted-foreground ml-2">
                      matéria{stats.materiasLegislatura === 1 ? "" : "s"}
                    </span>
                  </p>
                  <StatBar
                    value={stats.materiasLegislatura}
                    total={stats.totalMateriasPortal}
                    label={
                      pctPortal
                        ? `Representa ${pctPortal}% de todas as matérias do portal`
                        : "Produção na legislatura"
                    }
                  />
                </div>
                <div className="card-modern p-5 md:p-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Exercício Atual — {stats.exercicioAtual}
                  </p>
                  <p className="text-3xl font-bold text-foreground mb-3">
                    {stats.materiasExercicio}
                    <span className="text-sm font-medium text-muted-foreground ml-2">
                      matéria{stats.materiasExercicio === 1 ? "" : "s"} em {stats.exercicioAtual}
                    </span>
                  </p>
                  <StatBar
                    value={stats.materiasExercicio}
                    total={stats.totalMaterias}
                    label={`${stats.totalMaterias} matéria(s) no total vinculadas a este vereador(a)`}
                  />
                </div>
              </div>
            )}

            {/* ===== Tabs ===== */}
            <div className="card-modern overflow-hidden" data-reveal="up" data-reveal-delay="140">
              <div className="flex overflow-x-auto border-b border-border bg-muted/40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? "border-gold text-primary bg-card"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 md:p-7">
                {/* --- Produção Legislativa --- */}
                {activeTab === "producao" && (
                  <div className="space-y-8">
                    {activities.length > 0 ? (
                      <>
                        <div>
                          <h2 className="text-lg font-bold text-foreground mb-4">
                            Últimas matérias vinculadas
                          </h2>
                          <div className="space-y-3">
                            {activities.map((a) => (
                              <div
                                key={a.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 transition-colors"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-primary text-sm uppercase">{a.title}</p>
                                  {a.summary && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {a.summary}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-muted-foreground">
                                    {a.date && (
                                      <span className="inline-flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {a.date}
                                      </span>
                                    )}
                                    {statusBadge(a.status)}
                                  </div>
                                </div>
                                <a
                                  href={a.fileUrl || (a.slug ? `/atividades-legislativas/${a.slug}` : "/atividades-legislativas")}
                                  target={a.fileUrl ? "_blank" : undefined}
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity no-underline shrink-0"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Acessar
                                </a>
                              </div>
                            ))}
                          </div>
                          <Link
                            href={`/atividades-legislativas?autor=${encodeURIComponent(vereador.name)}`}
                            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-gradient-navy text-white text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
                          >
                            <FileText className="w-4 h-4" />
                            Mais matérias deste vereador(a)
                          </Link>
                        </div>

                        {stats && stats.byType.length > 0 && (
                          <div className="grid lg:grid-cols-2 gap-6">
                            <div className="rounded-xl border border-border/60 p-5">
                              <div className="flex items-center gap-2 mb-5">
                                <BarChart3 className="w-4 h-4 text-gold" />
                                <h3 className="font-semibold text-foreground text-sm">
                                  Matérias por tipo (quantidade)
                                </h3>
                              </div>
                              <TypeBars byType={stats.byType} />
                            </div>
                            <div className="rounded-xl border border-border/60 p-5">
                              <div className="flex items-center gap-2 mb-5">
                                <PieChart className="w-4 h-4 text-gold" />
                                <h3 className="font-semibold text-foreground text-sm">
                                  Matérias por tipo (percentual)
                                </h3>
                              </div>
                              <DonutChart byType={stats.byType} />
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm text-center py-8">
                        Nenhuma matéria vinculada a este vereador(a) até o momento.
                      </p>
                    )}
                  </div>
                )}

                {/* --- Comissões --- */}
                {activeTab === "comissoes" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {comissoes.map((m) => (
                      <div key={m.id} className="p-4 rounded-xl border border-border/60 bg-muted/30">
                        <p className="font-bold text-foreground text-sm">{m.committee?.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/25 text-[11px] font-semibold">
                            {m.role}
                          </span>
                          {m.committee?.type && (
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold capitalize">
                              {m.committee.type}
                            </span>
                          )}
                        </div>
                        {m.committee?.legislature && (
                          <p className="text-xs text-muted-foreground mt-2">{m.committee.legislature}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* --- Mandatos --- */}
                {activeTab === "mandatos" && (
                  <div className="space-y-3">
                    {mandatos.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-muted/30"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Landmark className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-sm">{m.position}</p>
                          {m.biennium?.name && (
                            <p className="text-xs text-muted-foreground">{m.biennium.name}</p>
                          )}
                        </div>
                        {m.biennium?.isCurrent && (
                          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold shrink-0">
                            Atual
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* --- Biografia --- */}
                {activeTab === "biografia" && vereador.biography && (
                  <div
                    className="prose prose-sm max-w-none prose-p:text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: vereador.biography }}
                  />
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
