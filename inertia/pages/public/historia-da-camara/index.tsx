import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { RichText } from "~/lib/rich_text";
import { Building2, Calendar, Users, Award } from "lucide-react";

interface InstitutionalEntry { title: string; content: string; }
interface Props { institutional?: Record<string, InstitutionalEntry>; }

export default function HistoriaIndex({ institutional }: Props) {
  const entry = (key: string) => {
    const e = institutional?.[key];
    return e && e.content?.trim() ? e : undefined;
  };
  return (
    <>
      <SeoHead title="História da Câmara - Câmara Municipal de Sumé" description="Conheça a história da Câmara Municipal de Sumé e sua trajetória no Poder Legislativo." url="/historia-da-camara" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "História da Câmara" }]} />
        <PageHero badge="Institucional" title="História da Câmara" subtitle="A trajetória do Poder Legislativo de Sumé ao longo dos anos" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            <div className="max-w-4xl">

              {/* Stats */}
              <div data-reveal="up" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="card-modern p-5 text-center">
                  <Building2 className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">1951</p>
                  <p className="text-xs text-muted-foreground">Fundação</p>
                </div>
                <div className="card-modern p-5 text-center">
                  <Calendar className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">70+</p>
                  <p className="text-xs text-muted-foreground">Anos de História</p>
                </div>
                <div className="card-modern p-5 text-center">
                  <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">9</p>
                  <p className="text-xs text-muted-foreground">Vereadores</p>
                </div>
                <div className="card-modern p-5 text-center">
                  <Award className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">19ª</p>
                  <p className="text-xs text-muted-foreground">Legislatura</p>
                </div>
              </div>

              <article data-reveal="up" className="card-modern p-6 md:p-10">
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
                  {entry("historia_intro") ? (
                    <RichText className="lead" text={entry("historia_intro")!.content} />
                  ) : (
                    <p className="lead">A Câmara Municipal de Sumé tem uma rica história que se confunde com o desenvolvimento do próprio município no Cariri Paraibano.</p>
                  )}
                  <h2>{entry("historia_trajetoria")?.title || "Nossa Trajetória"}</h2>
                  {entry("historia_trajetoria") ? (
                    <RichText text={entry("historia_trajetoria")!.content} />
                  ) : (
                    <p>Desde sua instalação em 1951, ano da emancipação política de Sumé, a Câmara Municipal tem sido palco de importantes decisões que moldaram o desenvolvimento do município.</p>
                  )}
                  <h2>{entry("historia_poder_legislativo")?.title || "O Poder Legislativo"}</h2>
                  {entry("historia_poder_legislativo") ? (
                    <RichText text={entry("historia_poder_legislativo")!.content} />
                  ) : (
                    <p>Composta atualmente por 9 vereadores eleitos democraticamente pela população, a Casa Legislativa trabalha na elaboração de leis, fiscalização do Executivo e representação dos interesses da comunidade.</p>
                  )}
                  <h2>{entry("historia_transparencia")?.title || "Compromisso com a Transparência"}</h2>
                  {entry("historia_transparencia") ? (
                    <RichText text={entry("historia_transparencia")!.content} />
                  ) : (
                    <p>A Câmara Municipal de Sumé preza pela transparência em todas as suas ações, disponibilizando informações sobre suas atividades legislativas, gastos públicos e decisões através deste Portal.</p>
                  )}
                </div>
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
