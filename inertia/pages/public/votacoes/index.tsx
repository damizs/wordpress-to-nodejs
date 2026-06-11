import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import {
  Calendar, Vote, ChevronLeft, ChevronRight, ChevronDown, Search, X,
  CheckCircle2, XCircle, MinusCircle, UserX, FileText, Users,
} from "lucide-react";

interface VoteEntry { name: string; party: string | null; vote: string; }
interface Votacao {
  id: number;
  title: string;
  description: string | null;
  date: string;
  result: string;
  is_unanimous: boolean;
  session: { title: string; slug: string | null } | null;
  activity: { title: string | null; slug: string | null } | null;
  tally: Record<string, number>;
  votes: VoteEntry[];
}
interface Props {
  votacoes: Votacao[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  years?: number[];
  filters?: { year?: string; search?: string; result?: string };
}

const resultStyles: Record<string, { label: string; cls: string }> = {
  aprovado: { label: "Aprovado", cls: "bg-green-100 text-green-700" },
  rejeitado: { label: "Rejeitado", cls: "bg-red-100 text-red-700" },
  retirado: { label: "Retirado", cls: "bg-gray-100 text-gray-600" },
  adiado: { label: "Adiado", cls: "bg-amber-100 text-amber-700" },
  outro: { label: "Outro", cls: "bg-gray-100 text-gray-600" },
};

const voteStyles: Record<string, { label: string; cls: string; icon: any }> = {
  sim: { label: "Sim", cls: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
  nao: { label: "Não", cls: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  abstencao: { label: "Abstenção", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: MinusCircle },
  ausente: { label: "Ausente", cls: "bg-gray-50 text-gray-500 border-gray-200", icon: UserX },
  nao_votou: { label: "Não votou", cls: "bg-slate-50 text-slate-500 border-slate-200", icon: MinusCircle },
};

function VotacaoCard({ votacao, index }: { votacao: Votacao; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const result = resultStyles[votacao.result] || resultStyles.outro;
  const totalVotantes = (votacao.tally.sim || 0) + (votacao.tally.nao || 0) + (votacao.tally.abstencao || 0);

  return (
    <div data-reveal="up" data-reveal-delay={String(Math.min(index, 6) * 60)} className="card-modern card-shine overflow-hidden">
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${result.cls}`}>{result.label}</span>
              {votacao.is_unanimous && (
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">Unânime</span>
              )}
            </div>
            <h3 className="font-semibold text-foreground leading-snug">{votacao.title}</h3>
            {votacao.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{votacao.description}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />{new Date(votacao.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
          </span>
          {votacao.session && (
            votacao.session.slug ? (
              <Link href={`/atas/${votacao.session.slug}`} className="flex items-center gap-1.5 hover:text-primary transition-colors no-underline text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />{votacao.session.title}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />{votacao.session.title}</span>
            )
          )}
        </div>

        {/* Placar */}
        {votacao.votes.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {(["sim", "nao", "abstencao", "ausente"] as const).map((key) => {
                const style = voteStyles[key];
                const count = votacao.tally[key] || 0;
                return (
                  <div key={key} className={`rounded-xl border px-3 py-2 text-center ${style.cls}`}>
                    <p className="text-xl font-bold leading-none">{count}</p>
                    <p className="text-[11px] font-medium mt-1 uppercase tracking-wide">{style.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Barra proporcional sim/não/abstenção */}
            {totalVotantes > 0 && (
              <div className="h-2 rounded-full overflow-hidden bg-gray-100 flex mb-4">
                <div className="bg-green-500" style={{ width: `${((votacao.tally.sim || 0) / totalVotantes) * 100}%` }} />
                <div className="bg-red-500" style={{ width: `${((votacao.tally.nao || 0) / totalVotantes) * 100}%` }} />
                <div className="bg-amber-400" style={{ width: `${((votacao.tally.abstencao || 0) / totalVotantes) * 100}%` }} />
              </div>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Users className="w-4 h-4" />
              {expanded ? "Ocultar votos por vereador" : `Ver votos por vereador (${votacao.votes.length})`}
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>

            {expanded && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {votacao.votes.map((v, i) => {
                  const style = voteStyles[v.vote] || voteStyles.nao_votou;
                  const Icon = style.icon;
                  return (
                    <div key={i} className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${style.cls}`}>
                      <span className="text-sm font-medium truncate">
                        {v.name}
                        {v.party && <span className="font-normal opacity-70"> · {v.party}</span>}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold shrink-0">
                        <Icon className="w-3.5 h-3.5" />{style.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function VotacoesIndex({ votacoes = [], pagination, years = [], filters = {} }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  function applyFilters(patch: Record<string, string>) {
    const params: Record<string, string> = {};
    const year = patch.ano ?? filters.year ?? "";
    const search = patch.busca ?? filters.search ?? "";
    const result = patch.resultado ?? filters.result ?? "";
    if (year) params.ano = year;
    if (search) params.busca = search;
    if (result) params.resultado = result;
    router.get("/votacoes", params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.year || filters.search || filters.result);
  const queryString = `${filters.year ? `&ano=${filters.year}` : ""}${filters.search ? `&busca=${encodeURIComponent(filters.search)}` : ""}${filters.result ? `&resultado=${filters.result}` : ""}`;

  return (
    <>
      <SeoHead title="Votações Nominais - Câmara Municipal de Sumé" description="Acompanhe como cada vereador votou nas matérias apreciadas pela Câmara Municipal de Sumé." url="/votacoes" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Votações Nominais" }]} />
        <PageHero badge="Atividade Legislativa" title="Votações Nominais" subtitle="Veja como cada vereador votou nas matérias apreciadas em Plenário" />
        <main className="py-12">
          <div className="container mx-auto px-4">
            {/* Toolbar de filtros */}
            <div data-reveal="up" className="max-w-3xl mx-auto mb-8 card-modern p-4 flex flex-col sm:flex-row gap-3">
              <form
                className="relative flex-1"
                onSubmit={(e) => { e.preventDefault(); applyFilters({ busca: searchTerm }); }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar matéria..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </form>
              <select
                value={filters.year || ""}
                onChange={(e) => applyFilters({ ano: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Todos os anos</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={filters.result || ""}
                onChange={(e) => applyFilters({ resultado: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Todos os resultados</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="retirado">Retirado</option>
                <option value="adiado">Adiado</option>
              </select>
              {hasFilters && (
                <button
                  onClick={() => { setSearchTerm(""); router.get("/votacoes"); }}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4" /> Limpar
                </button>
              )}
            </div>

            {pagination?.total !== undefined && (
              <p data-reveal="fade" className="max-w-3xl mx-auto mb-6 text-sm text-muted-foreground text-right">
                {pagination.total} {pagination.total === 1 ? "votação" : "votações"}
              </p>
            )}

            {votacoes.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-5">
                {votacoes.map((v, i) => <VotacaoCard key={v.id} votacao={v} index={i} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Vote className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma votação encontrada</h3>
                <p className="text-muted-foreground text-sm">{hasFilters ? "Tente ajustar os filtros de busca" : "Em breve novos registros de votações"}</p>
              </div>
            )}

            {pagination && pagination.lastPage > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                {pagination.currentPage > 1 && (
                  <Link href={`/votacoes?page=${pagination.currentPage - 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors"><ChevronLeft className="w-5 h-5" /></Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">Página {pagination.currentPage} de {pagination.lastPage}</span>
                {pagination.currentPage < pagination.lastPage && (
                  <Link href={`/votacoes?page=${pagination.currentPage + 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors"><ChevronRight className="w-5 h-5" /></Link>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
