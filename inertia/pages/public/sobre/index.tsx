import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Target, Eye, Heart } from "lucide-react";

interface Props { content?: string; }

export default function SobreIndex({ content }: Props) {
  return (
    <>
      <SeoHead title="Sobre - Câmara Municipal de Sumé" description="Conheça a Câmara Municipal de Sumé, sua missão, visão e valores." url="/sobre" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Sobre" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Institucional</span>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Sobre a Câmara</h1>
              </div>

              {/* Mission, Vision, Values */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="card-modern p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Missão</h3>
                  <p className="text-sm text-muted-foreground">Representar os interesses da população, legislar com responsabilidade e fiscalizar o Poder Executivo.</p>
                </div>
                <div className="card-modern p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center mb-4">
                    <Eye className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Visão</h3>
                  <p className="text-sm text-muted-foreground">Ser referência em transparência e eficiência no Poder Legislativo municipal.</p>
                </div>
                <div className="card-modern p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                    <Heart className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">Valores</h3>
                  <p className="text-sm text-muted-foreground">Ética, transparência, compromisso social e respeito ao cidadão.</p>
                </div>
              </div>

              <article className="card-modern p-6 md:p-10">
                {content ? (
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <h2>O Poder Legislativo Municipal</h2>
                    <p>A Câmara Municipal de Sumé é o órgão do Poder Legislativo do município, responsável por elaborar leis, fiscalizar o Poder Executivo e representar os interesses da população sumeense.</p>
                    <h2>Atribuições</h2>
                    <p>Entre as principais atribuições da Câmara estão: elaborar leis municipais, aprovar o orçamento do município, fiscalizar a aplicação dos recursos públicos e garantir a transparência da gestão pública.</p>
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
