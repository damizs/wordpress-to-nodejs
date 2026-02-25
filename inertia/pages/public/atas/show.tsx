import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, Download } from "lucide-react";

interface Props { ata: { id: number; title: string; slug: string; date: string; content?: string; file_url?: string; }; }

export default function AtaShow({ ata }: Props) {
  return (
    <>
      <SeoHead title={`${ata.title} - Câmara Municipal de Sumé`} url={`/atas/${ata.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atas das Sessões", href: "/atas" }, { label: ata.title }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link href="/atas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline">
                <ArrowLeft className="w-4 h-4" />Voltar
              </Link>
              <article className="card-modern p-6 md:p-10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />{new Date(ata.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{ata.title}</h1>
                {ata.file_url && (
                  <a href={ata.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 btn-modern bg-primary text-primary-foreground mb-6 no-underline">
                    <Download className="w-5 h-5" />Baixar Documento
                  </a>
                )}
                {ata.content && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: ata.content }} />}
              </article>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
