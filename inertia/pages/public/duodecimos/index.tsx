import { router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Coins, Download, Info, Calendar, TrendingUp } from "lucide-react";

interface Row {
  month: number;
  previsto: number;
  recebido: number | null;
  diferenca: number;
  percentual: number;
  situacao: "recebido" | "pendente";
  repasseDate: string | null;
  documentUrl: string | null;
}

interface Totals {
  previsto: number;
  recebido: number;
  diferenca: number;
  percentual: number;
}

interface Props {
  rows: Row[];
  totals: Totals;
  years: number[];
  selectedYear: number;
  lastUpdate: string | null;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MONTHS_ABBR = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const pct = (v: number) =>
  `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v || 0)}%`;

/** Formata data ISO (yyyy-MM-dd) para dd/MM/yyyy sem depender de timezone */
const formatDate = (value: string | null) => {
  if (!value) return "—";
  const iso = String(value).slice(0, 10);
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
};

/**
 * Gráfico de evolução mensal previsto × recebido.
 * Cada coluna: "trilho" = previsto (planejado) e barra preenchida = recebido.
 * Linha pontilhada = % de execução acumulada ao longo do ano.
 * SVG/CSS puro, responsivo e dark-safe (sem libs externas).
 */
function EvolutionChart({
  rows,
  year,
}: {
  rows: Row[];
  year: number;
}) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.previsto, r.recebido ?? 0)));

  // Execução acumulada por mês (recebido acumulado ÷ previsto acumulado).
  let accReceived = 0;
  let accExpected = 0;
  const accPoints = rows.map((r) => {
    accExpected += r.previsto;
    if (r.situacao !== "pendente") accReceived += r.recebido ?? 0;
    return accExpected > 0 ? (accReceived / accExpected) * 100 : 0;
  });

  const n = rows.length;
  const linePath = accPoints
    .map((p, i) => {
      const x = n > 1 ? (i / (n - 1)) * 100 : 50;
      const y = 100 - Math.min(100, p);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const lastExec = accPoints[accPoints.length - 1] ?? 0;

  return (
    <div
      data-reveal="up"
      className="mb-6 rounded-2xl bg-card border border-border/60 shadow-sm p-5 lg:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground leading-tight m-0">
              Evolução da execução — {year}
            </h2>
            <p className="text-xs text-muted-foreground m-0">
              Repasse previsto × efetivamente recebido, mês a mês
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600 leading-none m-0 tabular-nums">
            {pct(lastExec)}
          </p>
          <p className="text-[11px] text-muted-foreground m-0">execução acumulada</p>
        </div>
      </div>

      <div className="relative">
        {/* Linha de execução acumulada (overlay SVG, mesma baseline das barras) */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-44 pointer-events-none overflow-visible"
          aria-hidden="true"
        >
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--gold))"
            strokeWidth="0.8"
            strokeDasharray="2 1.5"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Barras */}
        <div
          className="relative flex items-end justify-between gap-1 sm:gap-2 h-44"
          role="img"
          aria-label={`Gráfico de execução dos duodécimos de ${year}: ${pct(lastExec)} de execução acumulada.`}
        >
          {rows.map((r) => {
            const prevH = (r.previsto / max) * 100;
            const recH = r.situacao === "pendente" ? 0 : ((r.recebido ?? 0) / max) * 100;
            return (
              <div key={r.month} className="flex-1 h-full flex items-end justify-center min-w-0">
                <div className="relative w-full h-full flex items-end justify-center">
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 sm:w-7 rounded-t-md bg-muted"
                    style={{ height: `${prevH}%` }}
                    title={`${MONTHS[r.month - 1]} — Previsto: ${brl(r.previsto)}`}
                  />
                  <div
                    className="relative w-5 sm:w-7 rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                    style={{ height: `${recH}%` }}
                    title={`${MONTHS[r.month - 1]} — Recebido: ${
                      r.situacao === "pendente" ? "a receber" : brl(r.recebido ?? 0)
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rótulos dos meses (linha própria, alinhada às colunas) */}
      <div className="mt-1.5 flex justify-between gap-1 sm:gap-2">
        {rows.map((r) => (
          <span
            key={r.month}
            className="flex-1 text-center text-[10px] sm:text-xs text-muted-foreground tabular-nums min-w-0"
          >
            {MONTHS_ABBR[r.month - 1] ?? r.month}
          </span>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-emerald-600 to-emerald-400" />
          Recebido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-muted" />
          Previsto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-gold" />
          Execução acumulada
        </span>
      </div>
    </div>
  );
}

export default function DuodecimosIndex({
  rows = [],
  totals,
  years = [],
  selectedYear,
  lastUpdate,
}: Props) {
  const hasRows = rows.length > 0;

  return (
    <>
      <SeoHead
        title="Duodécimos - Câmara Municipal de Sumé"
        description="Repasses mensais de duodécimos (1/12 do orçamento) do Poder Executivo à Câmara Municipal de Sumé."
        url="/duodecimos"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb
          items={[{ label: "Transparência", href: "/transparencia" }, { label: "Duodécimos" }]}
        />
        <PageHero
          badge="Transparência Ativa"
          title="Duodécimos"
          subtitle="Acompanhe os repasses mensais do duodécimo do Poder Executivo à Câmara Municipal"
          centered
        />

        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div>
                {/* Caixa informativa */}
                <div
                  data-reveal="up"
                  className="mb-8 flex gap-4 rounded-2xl border border-sky/20 bg-sky/5 p-5 lg:p-6"
                >
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-sky/15 text-sky flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <div className="text-sm leading-relaxed text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">O que é o duodécimo?</p>
                    <p>
                      O duodécimo é o repasse mensal correspondente a{" "}
                      <strong className="text-foreground">1/12 (um doze avos)</strong> da dotação
                      orçamentária anual destinada ao Poder Legislativo. A entrega obrigatória, até o
                      dia 20 de cada mês, está prevista no{" "}
                      <strong className="text-foreground">art. 168 da Constituição Federal</strong> e
                      na <strong className="text-foreground">Lei Complementar nº 101/2000</strong>{" "}
                      (Lei de Responsabilidade Fiscal).
                    </p>
                  </div>
                </div>

                {/* Seletor de ano */}
                <div
                  data-reveal="up"
                  className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex items-center gap-2 flex-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-muted-foreground/70" />
                    <span>Selecione o ano de exercício para visualizar os repasses</span>
                  </div>
                  {years.length > 0 && (
                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        router.get("/duodecimos", { ano: e.target.value }, { preserveScroll: true })
                      }
                      aria-label="Ano de exercício"
                      className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {hasRows ? (
                  <>
                  <EvolutionChart rows={rows} year={selectedYear} />
                  <div
                    data-reveal="up"
                    className="rounded-2xl overflow-hidden shadow-xl bg-card border border-border/60"
                  >
                    {/* Cabeçalho do card */}
                    <div className="bg-gradient-hero px-6 py-5 flex items-center justify-between gap-4 text-primary-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                          <Coins className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold m-0 leading-tight">
                            Repasses de {selectedYear}
                          </h2>
                          <p className="text-xs text-primary-foreground/70 m-0">
                            Valores previstos e efetivamente recebidos
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-navy text-white text-left">
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Mês</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Previsto</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Recebido</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">Diferença</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap text-right">% Execução</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap">Data do Repasse</th>
                            <th className="px-4 py-3 font-semibold whitespace-nowrap text-center">Situação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {rows.map((r) => {
                            const pendente = r.situacao === "pendente";
                            return (
                              <tr
                                key={r.month}
                                className={`odd:bg-muted/40 hover:bg-muted/60 transition-colors ${
                                  pendente ? "text-muted-foreground italic" : "text-foreground"
                                }`}
                              >
                                <td className="px-4 py-3 font-medium whitespace-nowrap">
                                  {MONTHS[r.month - 1] ?? r.month}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                                  {brl(r.previsto)}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                                  {pendente ? "—" : brl(r.recebido ?? 0)}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                                  {pendente ? "—" : brl(r.diferenca)}
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                                  {pendente ? "—" : pct(r.percentual)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {formatDate(r.repasseDate)}
                                </td>
                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center gap-2 justify-center">
                                    {pendente ? (
                                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700">
                                        Pendente
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-600/10 text-emerald-700">
                                        Recebido
                                      </span>
                                    )}
                                    {r.documentUrl && (
                                      <a
                                        href={r.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Baixar comprovante"
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                      >
                                        <Download className="w-4 h-4" />
                                      </a>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-navy/10 font-bold text-foreground border-t-2 border-navy/30">
                            <td className="px-4 py-3.5 whitespace-nowrap">Total {selectedYear}</td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap tabular-nums">
                              {brl(totals.previsto)}
                            </td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap tabular-nums">
                              {brl(totals.recebido)}
                            </td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap tabular-nums">
                              {brl(totals.diferenca)}
                            </td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap tabular-nums">
                              {pct(totals.percentual)}
                            </td>
                            <td className="px-4 py-3.5" colSpan={2} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Rodapé do card */}
                    <div className="px-6 py-4 bg-muted/40 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs text-muted-foreground m-0">
                        Diferença = Previsto − Recebido • % Execução = Recebido ÷ Previsto
                      </p>
                      {lastUpdate && (
                        <p className="text-xs text-muted-foreground m-0">
                          Última atualização:{" "}
                          <span className="font-medium text-foreground">
                            {formatDate(lastUpdate)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  </>
                ) : (
                  /* Estado vazio */
                  <div
                    data-reveal="up"
                    className="rounded-2xl border border-dashed border-border bg-card py-16 px-6 text-center"
                  >
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Coins className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      Nenhum repasse cadastrado
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {years.length > 0
                        ? `Ainda não há lançamentos de duodécimos para ${selectedYear}.`
                        : "Os repasses de duodécimos ainda não foram publicados."}
                    </p>
                  </div>
                )}

                {/* Nota legal */}
                <p className="mt-6 text-xs text-muted-foreground/80 leading-relaxed text-center">
                  Informação publicada em cumprimento ao dever de transparência ativa (Lei nº
                  12.527/2011 — Lei de Acesso à Informação) e ao art. 168 da Constituição Federal.
                  Os valores referem-se aos repasses do duodécimo do Poder Executivo Municipal à
                  Câmara Municipal de Sumé.
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
