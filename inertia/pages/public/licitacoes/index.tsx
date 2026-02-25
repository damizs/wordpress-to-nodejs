import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, Tag } from "lucide-react";

interface Licitacao { id: number; title: string; slug: string; number: string; modality?: string; date: string; status?: string; }
interface Props { licitacoes: Licitacao[]; }

export default function LicitacoesIndex({ licitacoes = [] }: Props) {
  const statusColors: Record<string, string> = {
    'em andamento': 'bg-blue-100 text-blue-700',
    'concluída': 'bg-emerald-100 text-emerald-700',
    'cancelada': 'bg-red-100 text-red-700',
    'suspensa': 'bg-amber-100 text-amber-700',
  };
  return (
    <>
      <SeoHead title="Licitações - Câmara Municipal de Sumé" description="Consulte os processos licitatórios da Câmara Municipal de Sumé." url="/licitacoes" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Licitações" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Transparência</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Licitações</h1>
            </div>
            {licitacoes.length > 0 ? (
              <div className="max-w-4xl mx-auto space-y-4">
                {licitacoes.map((lic) => (
                  <Link key={lic.id} href={`/licitacoes/${lic.slug}`} className="group no-underline">
                    <div className="card-modern p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-primary" /></div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{lic.number}</p>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{lic.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(lic.date).toLocaleDateString('pt-BR')}</span>
                              {lic.modality && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{lic.modality}</span>}
                            </div>
                          </div>
                        </div>
                        {lic.status && <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[lic.status.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>{lic.status}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-muted-foreground">Nenhuma licitação cadastrada.</p></div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
