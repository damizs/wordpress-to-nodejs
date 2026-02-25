import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, Download } from "lucide-react";

interface Props { publication: { id: number; title: string; slug: string; date: string; content?: string; file_url?: string; }; }

export default function PublicationShow({ publication }: Props) {
  return (
    <>
      <SeoHead title={`${publication.title} - Câmara Municipal de Sumé`} url={`/publicacoes-oficiais/${publication.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Publicações Oficiais", href: "/publicacoes-oficiais" }, { label: publication.title }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link href="/publicacoes-oficiais" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline"><ArrowLeft className="w-4 h-4" />Voltar</Link>
              <article className="card-modern p-6 md:p-10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4"><Calendar className="w-4 h-4" />{new Date(publication.date).toLocaleDateString('pt-BR')}</div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{publication.title}</h1>
                {publication.file_url && (
                  <a href={publication.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 btn-modern bg-primary text-primary-foreground mb-6 no-underline"><Download className="w-5 h-5" />Baixar</a>
                )}
                {publication.content && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: publication.content }} />}
              </article>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
