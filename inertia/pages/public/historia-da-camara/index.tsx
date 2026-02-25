import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Building2, Calendar, Users, Award } from "lucide-react";

interface Props { content?: string; }

export default function HistoriaIndex({ content }: Props) {
  return (
    <>
      <SeoHead title="História da Câmara - Câmara Municipal de Sumé" description="Conheça a história da Câmara Municipal de Sumé e sua trajetória no Poder Legislativo." url="/historia-da-camara" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "História da Câmara" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Institucional</span>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">História da Câmara</h1>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
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

              <article className="card-modern p-6 md:p-10">
                {content ? (
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <p className="lead">A Câmara Municipal de Sumé tem uma rica história que se confunde com o desenvolvimento do próprio município no Cariri Paraibano.</p>
                    <h2>Nossa Trajetória</h2>
                    <p>Desde sua instalação em 1951, ano da emancipação política de Sumé, a Câmara Municipal tem sido palco de importantes decisões que moldaram o desenvolvimento do município.</p>
                    <h2>O Poder Legislativo</h2>
                    <p>Composta atualmente por 9 vereadores eleitos democraticamente pela população, a Casa Legislativa trabalha na elaboração de leis, fiscalização do Executivo e representação dos interesses da comunidade.</p>
                    <h2>Compromisso com a Transparência</h2>
                    <p>A Câmara Municipal de Sumé preza pela transparência em todas as suas ações, disponibilizando informações sobre suas atividades legislativas, gastos públicos e decisões através deste Portal.</p>
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
