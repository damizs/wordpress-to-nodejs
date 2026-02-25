import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, Clock, MapPin } from "lucide-react";

interface Props { pauta: { id: number; title: string; slug: string; date: string; time?: string; location?: string; content?: string; items?: { id: number; title: string; description?: string }[]; }; }

export default function PautaShow({ pauta }: Props) {
  return (
    <>
      <SeoHead title={`${pauta.title} - Câmara Municipal de Sumé`} url={`/pautas/${pauta.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Pautas", href: "/pautas" }, { label: pauta.title }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link href="/pautas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline"><ArrowLeft className="w-4 h-4" />Voltar</Link>
              <article className="card-modern p-6 md:p-10">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{pauta.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(pauta.date).toLocaleDateString('pt-BR')}</span>
                  {pauta.time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{pauta.time}</span>}
                  {pauta.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{pauta.location}</span>}
                </div>
                {pauta.content && <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: pauta.content }} />}
                {pauta.items && pauta.items.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Itens da Pauta</h2>
                    <ol className="space-y-3">
                      {pauta.items.map((item, index) => (
                        <li key={item.id} className="p-4 bg-muted/50 rounded-xl">
                          <span className="font-semibold text-foreground">{index + 1}. {item.title}</span>
                          {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                        </li>
                      ))}
                    </ol>
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
