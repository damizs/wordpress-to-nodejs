import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface Ata { id: number; title: string; slug: string; date: string; file_url?: string; }
interface Props { atas: Ata[]; pagination?: { currentPage: number; lastPage: number; }; }

export default function AtasIndex({ atas = [], pagination }: Props) {
  return (
    <>
      <SeoHead title="Atas das Sessões - Câmara Municipal de Sumé" description="Acesse as atas das sessões plenárias da Câmara Municipal de Sumé." url="/atas" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atas das Sessões" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Documentos</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Atas das Sessões</h1>
            </div>
            {atas.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-4">
                {atas.map((ata) => (
                  <div key={ata.id} className="card-modern p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{ata.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{new Date(ata.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {ata.file_url ? (
                      <a href={ata.file_url} target="_blank" rel="noopener noreferrer" className="btn-modern bg-primary/10 text-primary p-2 no-underline"><Download className="w-5 h-5" /></a>
                    ) : (
                      <Link href={`/atas/${ata.slug}`} className="btn-modern bg-primary text-primary-foreground text-sm no-underline">Ver detalhes</Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-muted-foreground">Nenhuma ata cadastrada.</p></div>
            )}
            {pagination && pagination.lastPage > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {pagination.currentPage > 1 && <Link href={`/atas?page=${pagination.currentPage - 1}`} className="btn-modern bg-muted p-2 no-underline text-foreground"><ChevronLeft className="w-5 h-5" /></Link>}
                <span className="px-4 py-2 text-sm text-muted-foreground">Página {pagination.currentPage} de {pagination.lastPage}</span>
                {pagination.currentPage < pagination.lastPage && <Link href={`/atas?page=${pagination.currentPage + 1}`} className="btn-modern bg-muted p-2 no-underline text-foreground"><ChevronRight className="w-5 h-5" /></Link>}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
