import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, Download, FileText, Tag, Hash, CheckCircle2, Circle, CircleDollarSign, CalendarCheck, AlertTriangle } from "lucide-react";
import { DocumentActionsPanel, formatDocumentDate } from "~/components/DocumentActions";
import { SafeHtml } from "~/components/SafeHtml";

interface Attachment { id: number; name: string; url: string; }
interface DocumentGroup { type: string; label: string; files: { id: number; title: string; url: string }[]; }
interface Phase { type: string; label: string; done: boolean; }
interface Props {
  licitacao: {
    id: number;
    title: string;
    slug: string;
    number: string;
    modality?: string;
    date: string;
    status?: string;
    description?: string;
    content?: string;
    object?: string;
    estimated_value?: number | string | null;
    closing_date?: string | null;
    file_url?: string | null;
    attachments?: Attachment[];
  };
  documentGroups?: DocumentGroup[];
  phases?: Phase[];
}

// Faixa de status do processo (rito linear). Estados excepcionais viram alerta.
const STATUS_FLOW = [
  { key: "aberta", label: "Aberta" },
  { key: "em_andamento", label: "Em andamento" },
  { key: "encerrada", label: "Encerrada / Homologada" },
];
const STATUS_STEP: Record<string, number> = {
  aberta: 0, publicada: 0, agendada: 0,
  em_andamento: 1, andamento: 1, "em andamento": 1, suspensa: 1,
  encerrada: 2, concluida: 2, "concluída": 2, homologada: 2, adjudicada: 2, finalizada: 2,
};
const STATUS_EXCEPTION: Record<string, string> = {
  deserta: "Licitação deserta (nenhum participante)",
  fracassada: "Licitação fracassada",
  revogada: "Licitação revogada",
  cancelada: "Licitação cancelada",
  anulada: "Licitação anulada",
};

function formatCurrency(v: number | string | null | undefined): string | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function FileRow({ title, url }: { title: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/40 hover:border-primary/40 hover:bg-muted transition-colors no-underline group"
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <FileText className="w-4 h-4 shrink-0 text-primary" />
        <span className="truncate text-sm font-medium text-foreground">{title}</span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary shrink-0">
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Baixar</span>
      </span>
    </a>
  );
}

export default function LicitacaoShow({ licitacao, documentGroups = [], phases = [] }: Props) {
  const dateLabel = formatDocumentDate(licitacao.date, true);
  const closingLabel = formatDocumentDate(licitacao.closing_date || "", true);
  const valueLabel = formatCurrency(licitacao.estimated_value);
  const longText = licitacao.content || licitacao.description;
  // O controller também expõe o PDF principal como anexo de compatibilidade (id 0);
  // quando o painel de download já o exibe, evitamos duplicar na lista de anexos.
  const attachments = (licitacao.attachments || []).filter((a) => !(licitacao.file_url && a.url === licitacao.file_url));

  const statusKey = (licitacao.status || "").toLowerCase().trim();
  const exceptionLabel = STATUS_EXCEPTION[statusKey];
  const stepIndex = statusKey in STATUS_STEP ? STATUS_STEP[statusKey] : -1;
  const donePhases = phases.filter((p) => p.done).length;

  return (
    <>
      <SeoHead title={`${licitacao.number} - ${licitacao.title}`} url={`/licitacoes/${licitacao.slug}`} />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Licitações", href: "/licitacoes" }, { label: licitacao.number }]} />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div>
                <Link href="/licitacoes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline">
                  <ArrowLeft className="w-4 h-4" />Voltar para Licitações
                </Link>
                <article className="card-modern p-6 md:p-10">
                  {/* Cabeçalho */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {licitacao.modality && <span className="px-3 py-1 bg-gold/15 text-navy-dark dark:text-gold rounded-full text-xs font-semibold uppercase tracking-wide">{licitacao.modality}</span>}
                    {licitacao.status && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">{licitacao.status}</span>}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">{licitacao.title}</h1>

                  {/* Metadados */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {licitacao.number && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Hash className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Número</p>
                          <p className="text-sm font-semibold text-foreground">{licitacao.number}</p>
                        </div>
                      </div>
                    )}
                    {dateLabel && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Data de abertura</p>
                          <p className="text-sm font-semibold text-foreground">{dateLabel}</p>
                        </div>
                      </div>
                    )}
                    {licitacao.modality && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Tag className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Modalidade</p>
                          <p className="text-sm font-semibold text-foreground">{licitacao.modality}</p>
                        </div>
                      </div>
                    )}
                    {closingLabel && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <CalendarCheck className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Data de encerramento</p>
                          <p className="text-sm font-semibold text-foreground">{closingLabel}</p>
                        </div>
                      </div>
                    )}
                    {valueLabel && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <CircleDollarSign className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Valor estimado</p>
                          <p className="text-sm font-semibold text-foreground">{valueLabel}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Faixa de status do processo */}
                  {(stepIndex >= 0 || exceptionLabel) && (
                    <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
                      {exceptionLabel ? (
                        <div className="flex items-center gap-2.5 text-sm font-semibold text-destructive">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          {exceptionLabel}
                        </div>
                      ) : (
                        <ol className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
                          {STATUS_FLOW.map((step, i) => {
                            const reached = i <= stepIndex;
                            const current = i === stepIndex;
                            return (
                              <li key={step.key} className="flex items-center gap-3 sm:flex-1">
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border"
                                  }`}
                                >
                                  {reached ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                </span>
                                <span className={`text-sm ${current ? "font-bold text-foreground" : reached ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                                  {step.label}
                                </span>
                                {i < STATUS_FLOW.length - 1 && (
                                  <span className={`hidden sm:block flex-1 h-0.5 mx-2 rounded ${i < stepIndex ? "bg-primary" : "bg-border"}`} />
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </div>
                  )}

                  {licitacao.object && (
                    <div className="mb-6 p-4 rounded-xl border border-border bg-muted/40">
                      <h2 className="font-semibold text-foreground mb-2">Objeto</h2>
                      <p className="text-muted-foreground text-sm leading-relaxed">{licitacao.object}</p>
                    </div>
                  )}

                  {longText && (
                    <SafeHtml html={longText} className="prose prose-slate dark:prose-invert max-w-none mb-6" />
                  )}

                  {/* Edital / arquivo principal */}
                  <DocumentActionsPanel fileUrl={licitacao.file_url} label="Baixar Edital" className="mb-6" />

                  {/* Rito completo do processo: todas as fases da modalidade */}
                  {phases.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <h2 className="font-semibold text-foreground">Processo licitatório</h2>
                        <span className="text-xs text-muted-foreground shrink-0">{donePhases} de {phases.length} fases publicadas</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">Etapas do rito segundo a Lei 14.133/2021.</p>
                      <ol className="space-y-4">
                        {phases.map((phase) => {
                          const group = documentGroups.find((g) => g.type === phase.type);
                          return (
                            <li key={phase.type} className="relative pl-8">
                              <span className="absolute left-0 top-0.5">
                                {phase.done
                                  ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  : <Circle className="w-5 h-5 text-muted-foreground/40" />}
                              </span>
                              <h3 className={`text-sm font-semibold ${phase.done ? "text-foreground" : "text-muted-foreground"}`}>
                                {phase.label}
                              </h3>
                              {group ? (
                                <div className="mt-2 space-y-2">
                                  {group.files.map((file) => <FileRow key={file.id} title={file.title} url={file.url} />)}
                                </div>
                              ) : (
                                <p className="mt-1 text-xs italic text-muted-foreground/70">Ainda não publicado</p>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}

                  {/* Documentos fora do rito (tipo "Outros") */}
                  {documentGroups.filter((g) => !phases.some((p) => p.type === g.type)).map((group) => (
                    <div key={group.type} className="mb-6">
                      <h2 className="font-semibold text-foreground mb-3">{group.label}</h2>
                      <div className="space-y-2">
                        {group.files.map((file) => <FileRow key={file.id} title={file.title} url={file.url} />)}
                      </div>
                    </div>
                  ))}

                  {attachments.length > 0 && (
                    <div>
                      <h2 className="font-semibold text-foreground mb-4">Anexos</h2>
                      <div className="space-y-2">
                        {attachments.map((att) => <FileRow key={att.id} title={att.name} url={att.url} />)}
                      </div>
                    </div>
                  )}

                </article>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
