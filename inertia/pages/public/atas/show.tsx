import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft } from "lucide-react";
import { DocumentActionsPanel, formatDocumentDate } from "~/components/DocumentActions";

interface Props { ata: { id: number; title: string; slug: string; date: string; content?: string; file_url?: string; }; }

export default function AtaShow({ ata }: Props) {
  const dateLabel = formatDocumentDate(ata.date, true);
  const year = String(ata.date || "").slice(0, 4);

  return (
    <>
      <SeoHead title={`${ata.title} - Câmara Municipal de Sumé`} url={`/atas/${ata.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atas das Sessões", href: "/atas" }, { label: ata.title }]} />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                <Link href="/atas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline">
                  <ArrowLeft className="w-4 h-4" />Voltar para Atas das Sessões
                </Link>
                <article className="card-modern p-6 md:p-10">
                  {/* Cabeçalho do documento */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs font-semibold uppercase tracking-wide">Ata de Sessão</span>
                    {year && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">{year}</span>}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">{ata.title}</h1>
                  {dateLabel && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                      <Calendar className="w-4 h-4 text-primary" />Sessão realizada em {dateLabel}
                    </div>
                  )}

                  {/* Ações do documento */}
                  <DocumentActionsPanel fileUrl={ata.file_url} className="mb-8" />

                  {ata.content && (
                    <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: ata.content }} />
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
