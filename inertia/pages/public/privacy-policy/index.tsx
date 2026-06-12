import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";

interface Props { content?: string; }

export default function PrivacyPolicyIndex({ content }: Props) {
  return (
    <>
      <SeoHead title="Política de Privacidade - Câmara Municipal de Sumé" description="Conheça nossa política de privacidade e como tratamos seus dados pessoais." url="/politica-de-privacidade" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Política de Privacidade" }]} />
        <PageHero badge="LGPD" title="Política de Privacidade" subtitle="Em conformidade com a Lei Geral de Proteção de Dados — Lei nº 13.709/2018" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                <article className="card-modern p-6 md:p-10">
                  {content ? (
                    <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      <h2>1. Informações Gerais</h2>
                      <p>A Câmara Municipal de Sumé está comprometida com a proteção da privacidade e dos dados pessoais de todos os usuários deste portal, em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
                      <h2>2. Dados Coletados</h2>
                      <p>Coletamos apenas os dados necessários para a prestação de nossos serviços ao cidadão, incluindo nome, e-mail e informações de contato quando fornecidos voluntariamente.</p>
                      <h2>3. Uso dos Dados</h2>
                      <p>Os dados coletados são utilizados exclusivamente para responder às solicitações dos cidadãos e melhorar nossos serviços públicos.</p>
                      <h2>4. Contato</h2>
                      <p>Para dúvidas sobre esta política ou exercício de seus direitos, entre em contato através da Ouvidoria.</p>
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
