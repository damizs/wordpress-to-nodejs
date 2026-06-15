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
  GraduationCap,
  Flag,
  Heart,
  User,
  IdCard,
  History,
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
    gender?: string | null;
    maritalStatus?: string | null;
    educationLevel?: string | null;
    photo?: string;
    role?: string;
    email?: string;
    phone?: string;
    bio?: string | null;
    history?: string | null;
    biography?: string;
    isActive?: boolean;
    legislature?: {
      name: string;
      number?: number | null;
      period?: string | null;
    } | null;
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
    cls = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
  else if (s.includes("tramita"))
    cls = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
  else if (s.includes("rejeitado") || s.includes("vetado"))
    cls = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25";
  else if (s.includes("arquivado")) cls = "bg-muted text-muted-foreground border-border";
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
      <div className="h-2 rounded-full bg-muted overflow-hidden">
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
    <div className="space-y-3.5">
      {byType.map((t, i) => (
        <div key={t.type}>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-foreground font-medium truncate">{t.type}</span>
            <span className="text-muted-foreground font-semibold ml-2 shrink-0 tabular-nums">{t.count}</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
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
  const hasBio = !!(vereador.bio || vereador.biography);
  const hasHistory = !!vereador.history;

  const tabs = [
    { id: "producao", label: "Produção Legislativa", icon: FileText, show: true },
    { id: "comissoes", label: "Comissões", icon: Users, show: comissoes.length > 0 },
    { id: "mandatos", label: "Mandatos", icon: Landmark, show: mandatos.length > 0 },
    { id: "biografia", label: "Biografia", icon: BookOpen, show: hasBio || hasHistory },
  ].filter((t) => t.show);

  // Itens "Dados do Parlamentar" — só os preenchidos
  const dataItems = [
    { icon: Flag, label: "Partido", value: vereador.party },
    { icon: GraduationCap, label: "Grau de Instrução", value: vereador.educationLevel },
    { icon: User, label: "Sexo", value: vereador.gender },
    { icon: Heart, label: "Estado Civil", value: vereador.maritalStatus },
    {
      icon: Landmark,
      label: "Legislatura",
      value: vereador.legislature
        ? [
            vereador.legislature.number
              ? `${vereador.legislature.number}ª Legislatura`
              : vereador.legislature.name,
            vereador.legislature.period,
          ]
            .filter(Boolean)
            .join(" — ")
        : null,
    },
  ].filter((i) => !!i.value);

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

        {/* ===== Hero do perfil ===== */}
        <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/10 rounded-full blur-3xl" />
          </div>

          <div className="relative container py-10 lg:py-14">
            <Link
              href="/vereadores"
              className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-8 no-underline"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Voltar para vereadores
            </Link>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 md:gap-8 text-center sm:text-left" data-reveal="up">
              {/* Foto com ring dourado */}
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden ring-4 ring-gold/80 ring-offset-4 ring-offset-transparent shadow-xl shrink-0 bg-muted">
                {vereador.photo ? (
                  <img
                    src={vereador.photo}
                    alt={`Foto de ${vereador.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-5xl font-bold text-primary/50"
                    aria-hidden="true"
                  >
                    {vereador.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                  {vereador.role && (
                    <span className="inline-block px-3.5 py-1 bg-gold/15 text-gold border border-gold/25 text-xs font-bold rounded-full uppercase tracking-wider">
                      {vereador.role}
                    </span>
                  )}
                  {vereador.isActive === false ? (
                    <span className="inline-block px-3 py-1 bg-primary-foreground/10 text-primary-foreground/80 border border-primary-foreground/20 text-[11px] font-semibold rounded-full uppercase tracking-wider">
                      Mandato encerrado
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-emerald-400/15 text-emerald-200 border border-emerald-300/25 text-[11px] font-semibold rounded-full uppercase tracking-wider">
                      Em exercício
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  {vereador.name}
                  <BadgeCheck className="w-7 h-7 text-gold shrink-0" aria-label="Vereador verificado" />
                </h1>
                {vereador.fullName && vereador.fullName !== vereador.name && (
                  <p className="text-sm text-primary-foreground/70 mt-1">{vereador.fullName}</p>
                )}
                {vereador.party && (
                  <p className="text-base text-primary-foreground/85 font-medium mt-1.5">{vereador.party}</p>
                )}
                {vereador.legislature && (
                  <p className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/75 mt-1.5">
                    <Landmark className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                    {[
                      vereador.legislature.number
                        ? `${vereador.legislature.number}ª Legislatura`
                        : vereador.legislature.name,
                      vereador.legislature.period,
                    ]
                      .filter(Boolean)
                      .join(" — ")}
                  </p>
                )}

                {(vereador.email || vereador.phone) && (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 mt-5">
                    {vereador.email && (
                      <a
                        href={`mailto:${vereador.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-sm text-primary-foreground hover:bg-primary-foreground/20 transition-colors no-underline"
                      >
                        <Mail className="w-4 h-4 text-gold" aria-hidden="true" />
                        <span className="truncate max-w-[240px]">{vereador.email}</span>
                      </a>
                    )}
                    {vereador.phone && (
                      <a
                        href={`tel:${vereador.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-sm text-primary-foreground hover:bg-primary-foreground/20 transition-colors no-underline"
                      >
                        <Phone className="w-4 h-4 text-gold" aria-hidden="true" />
                        {vereador.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden="true" />
        </section>

        <main className="py-10 lg:py-14">
          <div className="container">
            {/* ===== Dados do Parlamentar + Contato ===== */}
            {(dataItems.length > 0 || vereador.email || vereador.phone) && (
              <div className="grid lg:grid-cols-3 gap-5 mb-10" data-reveal="up">
                {dataItems.length > 0 && (
                  <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <IdCard className="w-4 h-4 text-gold" aria-hidden="true" />
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Dados do Parlamentar
                      </h2>
                    </div>
                    <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                      {dataItems.map((item) => (
                        <div key={item.label} className="flex items-start gap-3">
                          <item.icon className="w-4 h-4 text-gold mt-0.5 shrink-0" aria-hidden="true" />
                          <div className="min-w-0">
                            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {item.label}
                            </dt>
                            <dd className="text-sm font-medium text-foreground mt-0.5 break-words">
                              {item.value}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {(vereador.email || vereador.phone) && (
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <Mail className="w-4 h-4 text-gold" aria-hidden="true" />
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Contato
                      </h2>
                    </div>
                    <ul className="space-y-3.5">
                      {vereador.email && (
                        <li>
                          <a
                            href={`mailto:${vereador.email}`}
                            className="inline-flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors no-underline break-all"
                          >
                            <Mail className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                            <span>{vereador.email}</span>
                          </a>
                        </li>
                      )}
                      {vereador.phone && (
                        <li>
                          <a
                            href={`tel:${vereador.phone}`}
                            className="inline-flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors no-underline"
                          >
                            <Phone className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                            <span>{vereador.phone}</span>
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ===== Stats ===== */}
            {stats && stats.totalMaterias > 0 && (
              <div className="grid md:grid-cols-2 gap-5 mb-10" data-reveal="up">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark className="w-4 h-4 text-gold" aria-hidden="true" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Legislatura Atual{stats.legislatura ? ` — ${stats.legislatura}` : ""}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-4">
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
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gold" aria-hidden="true" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Exercício Atual — {stats.exercicioAtual}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-4">
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

            {/* ===== Abas ===== */}
            <div data-reveal="up" data-reveal-delay="80">
              <div
                role="tablist"
                aria-label="Seções do perfil"
                className="flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" aria-hidden="true" />
                      {tab.label}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold origin-left transition-transform duration-300 ${
                          active ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="pt-7">
                {/* --- Produção Legislativa --- */}
                {activeTab === "producao" && (
                  <div className="space-y-10">
                    {activities.length > 0 ? (
                      <>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-6">
                            Últimas matérias vinculadas
                          </h2>
                          {/* Timeline */}
                          <ol className="relative border-l-2 border-border ml-2 space-y-7">
                            {activities.map((a) => (
                              <li key={a.id} className="relative pl-7">
                                <span
                                  aria-hidden="true"
                                  className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-gold ring-4 ring-background"
                                />
                                <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground mb-1">
                                  {a.date && (
                                    <span className="inline-flex items-center gap-1.5 font-medium">
                                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                      {a.date}
                                    </span>
                                  )}
                                  {statusBadge(a.status)}
                                </div>
                                <h3 className="font-semibold text-foreground leading-snug">{a.title}</h3>
                                {a.summary && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                                    {a.summary}
                                  </p>
                                )}
                                <a
                                  href={a.fileUrl || (a.slug ? `/atividades-legislativas/${a.slug}` : "/atividades-legislativas")}
                                  target={a.fileUrl ? "_blank" : undefined}
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-primary hover:text-gold transition-colors no-underline"
                                >
                                  Acessar matéria
                                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                </a>
                              </li>
                            ))}
                          </ol>
                          <Link
                            href={`/atividades-legislativas?autor=${encodeURIComponent(vereador.name)}`}
                            className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 rounded-xl bg-gradient-navy text-white text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
                          >
                            <FileText className="w-4 h-4" aria-hidden="true" />
                            Mais matérias deste vereador(a)
                          </Link>
                        </div>

                        {stats && stats.byType.length > 0 && (
                          <div className="grid lg:grid-cols-2 gap-5">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                              <div className="flex items-center gap-2 mb-5">
                                <BarChart3 className="w-4 h-4 text-gold" aria-hidden="true" />
                                <h3 className="font-semibold text-foreground text-sm">
                                  Matérias por tipo (quantidade)
                                </h3>
                              </div>
                              <TypeBars byType={stats.byType} />
                            </div>
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                              <div className="flex items-center gap-2 mb-5">
                                <PieChart className="w-4 h-4 text-gold" aria-hidden="true" />
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
                      <p className="text-muted-foreground text-sm text-center py-10">
                        Nenhuma matéria vinculada a este vereador(a) até o momento.
                      </p>
                    )}
                  </div>
                )}

                {/* --- Comissões --- */}
                {activeTab === "comissoes" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {comissoes.map((m) => (
                      <div key={m.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                        <p className="font-semibold text-foreground text-sm leading-snug">{m.committee?.name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
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
                          <p className="text-xs text-muted-foreground mt-2.5">{m.committee.legislature}</p>
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
                        className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Landmark className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm">{m.position}</p>
                          {m.biennium?.name && (
                            <p className="text-xs text-muted-foreground mt-0.5">{m.biennium.name}</p>
                          )}
                        </div>
                        {m.biennium?.isCurrent && (
                          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[11px] font-semibold shrink-0">
                            Atual
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* --- Biografia / Trajetória --- */}
                {activeTab === "biografia" && (hasBio || hasHistory) && (
                  <div className="space-y-10">
                    {hasBio && (
                      <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground mb-5">
                          <BookOpen className="w-5 h-5 text-gold" aria-hidden="true" />
                          Biografia
                        </h2>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary"
                          dangerouslySetInnerHTML={{
                            __html: (vereador.bio || vereador.biography) as string,
                          }}
                        />
                      </div>
                    )}
                    {hasHistory && (
                      <div>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground mb-5">
                          <History className="w-5 h-5 text-gold" aria-hidden="true" />
                          História e Trajetória
                        </h2>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary"
                          dangerouslySetInnerHTML={{ __html: vereador.history as string }}
                        />
                      </div>
                    )}
                  </div>
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
