import { Link } from "@inertiajs/react";
import { PageLayout } from "~/components/PageLayout";
import { Calendar, ArrowLeft, User, Hash, Landmark, GitBranch, ExternalLink } from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";
import { OfficialDocument } from "~/components/OfficialDocument";
import { RichContent } from "~/components/RichContent";

interface Author { id: number; name: string; slug: string; photo: string | null; party: string | null; }
interface Props {
  activity: {
    id: number;
    title?: string | null;
    slug: string;
    type?: string;
    number?: string;
    year?: number;
    summary?: string | null;
    content?: string;
    status?: string;
    origin?: string;
    origin_label?: string;
    fileUrl?: string | null;
    sessionDate?: string | null;
    voting_system_url?: string | null;
    votingSystemUrl?: string | null;
    tramitation_steps?: Array<{
      date?: string | null;
      title: string;
      description?: string | null;
      status?: string | null;
    }> | null;
    tramitationSteps?: Array<{
      date?: string | null;
      title: string;
      description?: string | null;
      status?: string | null;
    }> | null;
    author?: string | null;
    createdAt?: string;
  };
  authors?: Author[];
  exportUrl?: string;
}

export default function ActivityShow({ activity, authors = [], exportUrl }: Props) {
  const title = activity.title || `${activity.type} nº ${activity.number}/${activity.year}`;
  const dateLabel = formatDocumentDate(activity.sessionDate || activity.createdAt, true);
  const tramitationSteps = activity.tramitationSteps || activity.tramitation_steps || [];
  const votingSystemUrl = activity.votingSystemUrl || activity.voting_system_url;

  return (
    <PageLayout
      seo={{ title, url: `/atividades-legislativas/${activity.slug}` }}
      breadcrumb={[{ label: "Atividades Legislativas", href: "/atividades-legislativas" }, { label: title }]}
    >
      <Link href="/atividades-legislativas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline">
        <ArrowLeft className="w-4 h-4" />Voltar para Atividades Legislativas
      </Link>
      <OfficialDocument
        url={`/atividades-legislativas/${activity.slug}`}
        fileUrl={activity.fileUrl}
        exportUrl={exportUrl}
        shareTitle={title}
      >
                  {/* Cabeçalho do documento */}
                  <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {activity.type && <span className="px-3 py-1 bg-gold/15 text-navy-dark dark:text-gold rounded-full text-xs font-semibold uppercase tracking-wide">{activity.type}</span>}
                      {activity.number && activity.year && (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">Nº {activity.number}/{activity.year}</span>
                      )}
                      {activity.status && <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">{activity.status}</span>}
                      {activity.origin_label && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">{activity.origin_label}</span>}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold text-foreground leading-tight">{title}</h1>
                  </div>

                  {/* Metadados */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {dateLabel && (
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
                        <Calendar className="w-5 h-5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Data</p>
                          <p className="text-base font-semibold text-foreground">{dateLabel}</p>
                        </div>
                      </div>
                    )}
                    {activity.number && (
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
                        <Hash className="w-5 h-5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Número</p>
                          <p className="text-base font-semibold text-foreground">{activity.number}{activity.year ? "/" + activity.year : ""}</p>
                        </div>
                      </div>
                    )}
                    {authors.length === 0 && activity.author && (
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
                        <User className="w-5 h-5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Autoria</p>
                          <p className="text-base font-semibold text-foreground">{activity.author}</p>
                        </div>
                      </div>
                    )}
                    {activity.origin_label && (
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3">
                        <Landmark className="w-5 h-5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Origem</p>
                          <p className="text-base font-semibold text-foreground">{activity.origin_label}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Autores vinculados (perfil do vereador) */}
                  {authors.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        Autoria
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {authors.map((a) => (
                          <Link
                            key={a.id}
                            href={`/vereadores/${a.slug}`}
                            className="inline-flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border border-border bg-muted/40 hover:border-primary/40 hover:bg-muted transition-colors no-underline"
                          >
                            {a.photo ? (
                              <img src={a.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {a.name.charAt(0)}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-foreground">{a.name}</span>
                            {a.party && <span className="text-xs text-muted-foreground">{a.party}</span>}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {activity.summary && (
                    <p className="text-base text-muted-foreground border-l-4 border-gold/60 pl-4 mb-6">{activity.summary}</p>
                  )}

                  {(tramitationSteps.length > 0 || votingSystemUrl) && (
                    <div className="mb-6 rounded-2xl border border-border bg-muted/30 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <GitBranch className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-foreground">Tramitação</h2>
                            <p className="text-sm text-muted-foreground">Histórico de movimentação da matéria legislativa.</p>
                          </div>
                        </div>
                        {votingSystemUrl && (
                          <a
                            href={votingSystemUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
                          >
                            Sistema de votação <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      {tramitationSteps.length > 0 && (
                        <ol className="mt-5 space-y-3">
                          {tramitationSteps.map((step, index) => (
                            <li key={`${step.title}-${index}`} className="grid grid-cols-[auto_1fr] gap-3">
                              <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                                {index + 1}
                              </span>
                              <div className="rounded-xl border border-border bg-card p-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold text-foreground">{step.title}</p>
                                  {step.date && (
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                      {formatDocumentDate(step.date, true)}
                                    </span>
                                  )}
                                  {step.status && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                      {step.status}
                                    </span>
                                  )}
                                </div>
                                {step.description && (
                                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}
      {activity.content && (
        <RichContent html={activity.content} />
      )}
      </OfficialDocument>
    </PageLayout>
  );
}
