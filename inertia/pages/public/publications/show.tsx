import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, Hash, Tag } from "lucide-react";
import { DocumentActionsPanel, formatDocumentDate } from "~/components/DocumentActions";

interface Props {
  publication: {
    id: number;
    title: string;
    slug?: string | null;
    type?: string | null;
    number?: string | null;
    publicationDate?: string | null;
    fileUrl?: string | null;
    description?: string | null;
  };
}

export default function PublicationShow({ publication }: Props) {
  const dateLabel = formatDocumentDate(publication.publicationDate, true);
  const year = String(publication.publicationDate || "").slice(0, 4);

  return (
    <>
      <SeoHead title={`${publication.title} - Câmara Municipal de Sumé`} url={`/publicacoes-oficiais/${publication.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Publicações Oficiais", href: "/publicacoes-oficiais" }, { label: publication.title }]} />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div>
                <Link href="/publicacoes-oficiais" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline">
                  <ArrowLeft className="w-4 h-4" />Voltar para Publicações Oficiais
                </Link>
                <article className="card-modern p-6 md:p-10">
                  {/* Cabeçalho do documento */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {publication.type && (
                      <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-semibold uppercase tracking-wide">{publication.type}</span>
                    )}
                    {publication.number && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                        Nº {publication.number}{year ? `/${year}` : ""}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">{publication.title}</h1>

                  {/* Metadados */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    {dateLabel && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Data de publicação</p>
                          <p className="text-sm font-semibold text-foreground">{dateLabel}</p>
                        </div>
                      </div>
                    )}
                    {publication.number && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Hash className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Número</p>
                          <p className="text-sm font-semibold text-foreground">{publication.number}</p>
                        </div>
                      </div>
                    )}
                    {publication.type && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Tag className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Tipo</p>
                          <p className="text-sm font-semibold text-foreground">{publication.type}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ações do documento */}
                  <DocumentActionsPanel fileUrl={publication.fileUrl} className="mb-8" />

                  {publication.description && (
                    <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: publication.description }} />
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
