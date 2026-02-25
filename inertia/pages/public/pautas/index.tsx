import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface Pauta { id: number; title: string; slug: string; date: string; session_type?: string; }
interface Props { pautas: Pauta[]; pagination?: { currentPage: number; lastPage: number; }; }

export default function PautasIndex({ pautas = [], pagination }: Props) {
  return (
    <>
      <SeoHead title="Pautas - Câmara Municipal de Sumé" description="Confira as pautas das sessões plenárias." url="/pautas" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Pautas" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Sessões</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Pautas das Sessões</h1>
            </div>
            {pautas.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-4">
                {pautas.map((pauta) => (
                  <Link key={pauta.id} href={`/pautas/${pauta.slug}`} className="group no-underline">
                    <div className="card-modern p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><FileText className="w-6 h-6 text-primary" /></div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{pauta.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(pauta.date).toLocaleDateString('pt-BR')}</span>
                          {pauta.session_type && <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full text-xs">{pauta.session_type}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-muted-foreground">Nenhuma pauta cadastrada.</p></div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
