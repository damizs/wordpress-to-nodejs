import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Shield } from "lucide-react";

interface Props { content?: string; }

export default function PrivacyPolicyIndex({ content }: Props) {
  return (
    <>
      <SeoHead title="Política de Privacidade - Câmara Municipal de Sumé" description="Conheça nossa política de privacidade e como tratamos seus dados pessoais." url="/politica-de-privacidade" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Política de Privacidade" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Política de Privacidade</h1>
                <p className="mt-2 text-muted-foreground">Em conformidade com a LGPD - Lei nº 13.709/2018</p>
              </div>
              <article className="card-modern p-6 md:p-10">
                {content ? (
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <div className="prose max-w-none">
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
        </main>
        <Footer />
      </div>
    </>
  );
}
