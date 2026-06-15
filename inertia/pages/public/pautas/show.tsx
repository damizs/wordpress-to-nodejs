import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, Clock, MapPin } from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";

interface Props { pauta: { id: number; title: string; slug: string; date: string; time?: string; location?: string; content?: string; items?: { id: number; title: string; description?: string }[]; }; }

export default function PautaShow({ pauta }: Props) {
  const dateLabel = formatDocumentDate(pauta.date, true);
  const year = String(pauta.date || "").slice(0, 4);

  return (
    <>
      <SeoHead title={`${pauta.title} - Câmara Municipal de Sumé`} url={`/pautas/${pauta.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Pautas", href: "/pautas" }, { label: pauta.title }]} />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div>
                <Link href="/pautas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline">
                  <ArrowLeft className="w-4 h-4" />Voltar para Pautas
                </Link>
                <article className="card-modern p-6 md:p-10">
                  {/* Cabeçalho do documento */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-gold/15 text-navy-dark dark:text-gold rounded-full text-xs font-semibold uppercase tracking-wide">Pauta de Sessão</span>
                    {year && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">{year}</span>}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">{pauta.title}</h1>

                  {/* Metadados */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    {dateLabel && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Data da sessão</p>
                          <p className="text-sm font-semibold text-foreground">{dateLabel}</p>
                        </div>
                      </div>
                    )}
                    {pauta.time && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Horário</p>
                          <p className="text-sm font-semibold text-foreground">{pauta.time}</p>
                        </div>
                      </div>
                    )}
                    {pauta.location && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Local</p>
                          <p className="text-sm font-semibold text-foreground">{pauta.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {pauta.content && (
                    <div className="prose prose-slate dark:prose-invert max-w-none mb-8" dangerouslySetInnerHTML={{ __html: pauta.content }} />
                  )}

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
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
