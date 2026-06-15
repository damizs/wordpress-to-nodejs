import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { RichText } from "~/lib/rich_text";
import { Target, Eye, Heart } from "lucide-react";

interface InstitutionalEntry { title: string; content: string; }
interface Props { institutional?: Record<string, InstitutionalEntry>; }

export default function SobreIndex({ institutional }: Props) {
  const entry = (key: string) => {
    const e = institutional?.[key];
    return e && e.content?.trim() ? e : undefined;
  };
  return (
    <>
      <SeoHead title="Sobre - Câmara Municipal de Sumé" description="Conheça a Câmara Municipal de Sumé, sua missão, visão e valores." url="/sobre" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Sobre" }]} />
        <PageHero badge="Institucional" title="Sobre a Câmara" subtitle="Conheça a história, a estrutura e o papel do Poder Legislativo Municipal" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            <div className="max-w-4xl">

              {/* Mission, Vision, Values */}
              <div data-reveal="up" className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="card-modern p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{entry("sobre_missao")?.title || "Missão"}</h3>
                  <p className="text-sm text-muted-foreground">{entry("sobre_missao")?.content || "Representar os interesses da população, legislar com responsabilidade e fiscalizar o Poder Executivo."}</p>
                </div>
                <div className="card-modern p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center mb-4">
                    <Eye className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{entry("sobre_visao")?.title || "Visão"}</h3>
                  <p className="text-sm text-muted-foreground">{entry("sobre_visao")?.content || "Ser referência em transparência e eficiência no Poder Legislativo municipal."}</p>
                </div>
                <div className="card-modern p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Heart className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{entry("sobre_valores")?.title || "Valores"}</h3>
                  <p className="text-sm text-muted-foreground">{entry("sobre_valores")?.content || "Ética, transparência, compromisso social e respeito ao cidadão."}</p>
                </div>
              </div>

              <article data-reveal="up" className="card-modern p-6 md:p-10">
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
                  <h2>{entry("sobre_intro")?.title || "O Poder Legislativo Municipal"}</h2>
                  {entry("sobre_intro") ? (
                    <RichText text={entry("sobre_intro")!.content} />
                  ) : (
                    <p>A Câmara Municipal de Sumé é o órgão do Poder Legislativo do município, responsável por elaborar leis, fiscalizar o Poder Executivo e representar os interesses da população sumeense.</p>
                  )}
                  <h2>{entry("sobre_atribuicoes")?.title || "Atribuições"}</h2>
                  {entry("sobre_atribuicoes") ? (
                    <RichText text={entry("sobre_atribuicoes")!.content} />
                  ) : (
                    <p>Entre as principais atribuições da Câmara estão: elaborar leis municipais, aprovar o orçamento do município, fiscalizar a aplicação dos recursos públicos e garantir a transparência da gestão pública.</p>
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
