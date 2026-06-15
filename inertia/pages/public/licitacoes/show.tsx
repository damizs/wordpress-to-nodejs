import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, Download, FileText, Tag, Hash } from "lucide-react";
import { DocumentActionsPanel, formatDocumentDate } from "~/components/DocumentActions";

interface Attachment { id: number; name: string; url: string; }
interface DocumentGroup { type: string; label: string; files: { id: number; title: string; url: string }[]; }
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
    file_url?: string | null;
    attachments?: Attachment[];
  };
  documentGroups?: DocumentGroup[];
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

export default function LicitacaoShow({ licitacao, documentGroups = [] }: Props) {
  const dateLabel = formatDocumentDate(licitacao.date, true);
  const longText = licitacao.content || licitacao.description;
  // O controller também expõe o PDF principal como anexo de compatibilidade (id 0);
  // quando o painel de download já o exibe, evitamos duplicar na lista de anexos.
  const attachments = (licitacao.attachments || []).filter((a) => !(licitacao.file_url && a.url === licitacao.file_url));

  return (
    <>
      <SeoHead title={`${licitacao.number} - ${licitacao.title}`} url={`/licitacoes/${licitacao.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Licitações", href: "/licitacoes" }, { label: licitacao.number }]} />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="max-w-4xl">
                <Link href="/licitacoes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline">
                  <ArrowLeft className="w-4 h-4" />Voltar para Licitações
                </Link>
                <article className="card-modern p-6 md:p-10">
                  {/* Cabeçalho */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {licitacao.modality && <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-semibold uppercase tracking-wide">{licitacao.modality}</span>}
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
                  </div>

                  {/* Edital / arquivo principal */}
                  <DocumentActionsPanel fileUrl={licitacao.file_url} label="Baixar Edital" className="mb-6" />

                  {licitacao.object && (
                    <div className="mb-6 p-4 rounded-xl border border-border bg-muted/40">
                      <h2 className="font-semibold text-foreground mb-2">Objeto</h2>
                      <p className="text-muted-foreground text-sm leading-relaxed">{licitacao.object}</p>
                    </div>
                  )}

                  {longText && (
                    <div className="prose prose-slate dark:prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: longText }} />
                  )}

                  {/* Documentos do processo, agrupados por fase */}
                  {documentGroups.length > 0 && (
                    <div className="mb-6">
                      <h2 className="font-semibold text-foreground mb-4">Documentos do Processo</h2>
                      <div className="space-y-5">
                        {documentGroups.map((group) => (
                          <div key={group.type}>
                            <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5" />
                              {group.label}
                            </h3>
                            <div className="space-y-2">
                              {group.files.map((file) => <FileRow key={file.id} title={file.title} url={file.url} />)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {attachments.length > 0 && (
                    <div>
                      <h2 className="font-semibold text-foreground mb-4">Anexos</h2>
                      <div className="space-y-2">
                        {attachments.map((att) => <FileRow key={att.id} title={att.name} url={att.url} />)}
                      </div>
                    </div>
                  )}

                  {!licitacao.file_url && documentGroups.length === 0 && attachments.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum documento disponível para este processo até o momento.</p>
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
