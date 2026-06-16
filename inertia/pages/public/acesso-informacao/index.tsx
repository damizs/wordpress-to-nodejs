import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { ESicSection } from "~/components/ESicSection";
import { useSiteSettings } from "~/hooks/use_site_settings";

/** Página SIC / LAI (critérios PNTP 12.x) — mesmo visual da home/Lovable. */
export default function AcessoInformacaoIndex() {
  const settings = useSiteSettings();
  const title = settings.homepage_esic_title || "E-SIC - Sistema Eletrônico de Informações";
  const subtitle =
    settings.homepage_esic_subtitle ||
    "Serviço de Informação ao Cidadão — unidade responsável, contato e pedidos via e-SIC";

  return (
    <>
      <SeoHead
        title="Acesso à Informação e e-SIC - Câmara Municipal de Sumé"
        description="Serviço de Informação ao Cidadão (SIC) da Câmara Municipal de Sumé. Endereço, telefone, horário e pedidos via e-SIC."
        url="/acesso-a-informacao"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Acesso à Informação" }]} />
        <PageHero
          badge="LAI — Lei 12.527/2011"
          title="Serviço de Informação ao Cidadão"
          subtitle="Setor de Comunicação e Relações Institucionais — autoridade de monitoramento do acesso à informação"
          centered
        />
        <main>
          <ESicSection title={title} subtitle={subtitle} hideHeading />
        </main>
        <Footer />
      </div>
    </>
  );
}
