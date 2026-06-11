import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, User, Tag, Download } from "lucide-react";

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
  const rawDate = activity.sessionDate || activity.createdAt;
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const dateLabel = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString("pt-BR")
    : null;

  return (
    <>
      <SeoHead title={`${title} - Câmara Municipal de Sumé`} url={`/atividades-legislativas/${activity.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atividades Legislativas", href: "/atividades-legislativas" }, { label: title }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link href="/atividades-legislativas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline"><ArrowLeft className="w-4 h-4" />Voltar</Link>
              <article className="card-modern p-6 md:p-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  {activity.type && <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{activity.type}</span>}
                  {activity.status && <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-semibold rounded-full">{activity.status}</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  {dateLabel && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{dateLabel}</span>}
                  {authors.length === 0 && activity.author && (
                    <span className="flex items-center gap-1"><User className="w-4 h-4" />{activity.author}</span>
                  )}
                </div>

                {/* Autores vinculados */}
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
                {activity.fileUrl && (
                  <a href={activity.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 btn-modern bg-primary text-primary-foreground mb-6 no-underline">
                    <Download className="w-5 h-5" />Baixar Documento
                  </a>
                )}
                {activity.content && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: activity.content }} />}
              </article>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
