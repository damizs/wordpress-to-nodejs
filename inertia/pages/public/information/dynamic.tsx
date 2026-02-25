import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { FileText, Download, Calendar, ExternalLink } from "lucide-react";

interface Attachment { id: number; name: string; url: string; }
interface Props { info: { id: number; title: string; slug: string; content?: string; updated_at?: string; attachments?: Attachment[]; }; }

export default function DynamicInfoPage({ info }: Props) {
  return (
    <>
      <SeoHead title={`${info.title} - Câmara Municipal de Sumé`} url={`/${info.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: info.title }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">{info.title}</h1>
                {info.updated_at && (
                  <p className="mt-2 text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Atualizado em {new Date(info.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <article className="card-modern p-6 md:p-10">
                {info.content ? (
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: info.content }} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">Conteúdo em atualização.</p>
                )}
                {info.attachments && info.attachments.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <h2 className="font-bold text-foreground mb-4">Anexos</h2>
                    <div className="space-y-2">
                      {info.attachments.map((att) => (
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
