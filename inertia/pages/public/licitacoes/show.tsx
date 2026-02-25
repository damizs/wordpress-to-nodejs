import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, Download, FileText, Tag } from "lucide-react";

interface Attachment { id: number; name: string; url: string; }
interface Props { licitacao: { id: number; title: string; slug: string; number: string; modality?: string; date: string; status?: string; description?: string; object?: string; attachments?: Attachment[]; }; }

export default function LicitacaoShow({ licitacao }: Props) {
  return (
    <>
      <SeoHead title={`${licitacao.number} - ${licitacao.title}`} url={`/licitacoes/${licitacao.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Licitações", href: "/licitacoes" }, { label: licitacao.number }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link href="/licitacoes" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline"><ArrowLeft className="w-4 h-4" />Voltar</Link>
              <article className="card-modern p-6 md:p-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  {licitacao.modality && <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{licitacao.modality}</span>}
                  {licitacao.status && <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-semibold rounded-full">{licitacao.status}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{licitacao.number}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{licitacao.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6"><Calendar className="w-4 h-4" />{new Date(licitacao.date).toLocaleDateString('pt-BR')}</div>
                {licitacao.object && (
                  <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                    <h2 className="font-semibold text-foreground mb-2">Objeto</h2>
                    <p className="text-muted-foreground">{licitacao.object}</p>
                  </div>
                )}
                {licitacao.description && <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: licitacao.description }} />}
                {licitacao.attachments && licitacao.attachments.length > 0 && (
                  <div>
                    <h2 className="font-semibold text-foreground mb-4">Anexos</h2>
                    <div className="space-y-2">
                      {licitacao.attachments.map((att) => (
                        <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors no-underline text-foreground">
                          <span className="flex items-center gap-2"><FileText className="w-4 h-4" />{att.name}</span>
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
