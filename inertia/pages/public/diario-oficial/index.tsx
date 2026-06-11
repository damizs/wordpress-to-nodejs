import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface GazetteEntry {
  id: number;
  edition_number: string;
  date: string;
  description?: string | null;
  file_url?: string | null;
}

interface Props {
  entries: GazetteEntry[];
  pagination?: { currentPage: number; lastPage: number };
}

export default function DiarioOficialIndex({ entries = [], pagination }: Props) {
  return (
    <>
      <SeoHead title="Diário Oficial - Câmara Municipal de Sumé" description="Acesse as edições do Diário Oficial da Câmara Municipal de Sumé." url="/diario-oficial" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Diário Oficial" }]} />
        <PageHero badge="Documentos Oficiais" title="Diário Oficial" subtitle="Edições do Diário Oficial da Câmara Municipal" centered />
        <main className="py-12">
          <div className="container mx-auto px-4">
            {entries.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="card-modern p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground">Edição nº {entry.edition_number}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        {entry.description && <p className="text-sm text-muted-foreground mt-0.5 truncate">{entry.description}</p>}
                      </div>
                    </div>
                    {entry.file_url && (
                      <a href={entry.file_url} target="_blank" rel="noopener noreferrer" className="btn-modern bg-primary/10 text-primary p-2 no-underline flex-shrink-0" title="Baixar edição">
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma edição publicada ainda.</p>
              </div>
            )}
            {pagination && pagination.lastPage > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {pagination.currentPage > 1 && <Link href={`/diario-oficial?page=${pagination.currentPage - 1}`} className="btn-modern bg-muted p-2 no-underline text-foreground"><ChevronLeft className="w-5 h-5" /></Link>}
                <span className="px-4 py-2 text-sm text-muted-foreground">Página {pagination.currentPage} de {pagination.lastPage}</span>
                {pagination.currentPage < pagination.lastPage && <Link href={`/diario-oficial?page=${pagination.currentPage + 1}`} className="btn-modern bg-muted p-2 no-underline text-foreground"><ChevronRight className="w-5 h-5" /></Link>}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
