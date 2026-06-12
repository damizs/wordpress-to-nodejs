import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, User, Hash } from "lucide-react";
import { DocumentActionsPanel, formatDocumentDate } from "~/components/DocumentActions";

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
    fileUrl?: string | null;
    sessionDate?: string | null;
    author?: string | null;
    createdAt?: string;
  };
  authors?: Author[];
}

export default function ActivityShow({ activity, authors = [] }: Props) {
  const title = activity.title || `${activity.type} nº ${activity.number}/${activity.year}`;
  const dateLabel = formatDocumentDate(activity.sessionDate || activity.createdAt, true);

  return (
    <>
      <SeoHead title={`${title} - Câmara Municipal de Sumé`} url={`/atividades-legislativas/${activity.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atividades Legislativas", href: "/atividades-legislativas" }, { label: title }]} />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                <Link href="/atividades-legislativas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline">
                  <ArrowLeft className="w-4 h-4" />Voltar para Atividades Legislativas
                </Link>
                <article className="card-modern p-6 md:p-10">
                  {/* Cabeçalho do documento */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {activity.type && <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-semibold uppercase tracking-wide">{activity.type}</span>}
                    {activity.number && activity.year && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">Nº {activity.number}/{activity.year}</span>
                    )}
                    {activity.status && <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">{activity.status}</span>}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">{title}</h1>

                  {/* Metadados */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {dateLabel && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Data</p>
                          <p className="text-sm font-semibold text-foreground">{dateLabel}</p>
                        </div>
                      </div>
                    )}
                    {activity.number && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Hash className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Número</p>
                          <p className="text-sm font-semibold text-foreground">{activity.number}{activity.year ? `/${activity.year}` : ""}</p>
                        </div>
                      </div>
                    )}
                    {authors.length === 0 && activity.author && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <User className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Autoria</p>
                          <p className="text-sm font-semibold text-foreground">{activity.author}</p>
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

                  {/* Ações do documento */}
                  <DocumentActionsPanel fileUrl={activity.fileUrl} className="mb-8" />

                  {activity.summary && (
                    <p className="text-base text-muted-foreground border-l-4 border-gold/60 pl-4 mb-6">{activity.summary}</p>
                  )}
                  {activity.content && (
                    <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: activity.content }} />
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
