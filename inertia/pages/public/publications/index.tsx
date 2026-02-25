import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, Download } from "lucide-react";

interface Publication { id: number; title: string; slug: string; date: string; type?: string; file_url?: string; }
interface Props { publications: Publication[]; }

export default function PublicationsIndex({ publications = [] }: Props) {
  return (
    <>
      <SeoHead title="Publicações Oficiais - Câmara Municipal de Sumé" description="Acesse as publicações oficiais da Câmara Municipal de Sumé." url="/publicacoes-oficiais" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Publicações Oficiais" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Documentos</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Publicações Oficiais</h1>
            </div>
            {publications.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-4">
                {publications.map((pub) => (
                  <div key={pub.id} className="card-modern p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-6 h-6 text-primary" /></div>
                      <div>
                        <h3 className="font-semibold text-foreground">{pub.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(pub.date).toLocaleDateString('pt-BR')}</span>
                          {pub.type && <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full text-xs">{pub.type}</span>}
                        </div>
                      </div>
                    </div>
                    {pub.file_url ? (
                      <a href={pub.file_url} target="_blank" rel="noopener noreferrer" className="btn-modern bg-primary/10 text-primary p-2 no-underline"><Download className="w-5 h-5" /></a>
                    ) : (
                      <Link href={`/publicacoes-oficiais/${pub.slug}`} className="btn-modern bg-primary text-primary-foreground text-sm no-underline">Ver</Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-muted-foreground">Nenhuma publicação cadastrada.</p></div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
