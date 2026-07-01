import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { ESicSection } from "~/components/ESicSection";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { usePage } from "@inertiajs/react";

/** Página SIC / LAI (critérios PNTP 12.x) — mesmo visual da home/Lovable. */
export default function AcessoInformacaoIndex() {
  const settings = useSiteSettings();
  const camara = (usePage().props as {
    camara?: { nome: string; cidade: string; uf: string };
  }).camara;
  const orgName = camara?.nome || settings.header_title || "Câmara Municipal";
  const title = settings.homepage_esic_title || "E-SIC - Sistema Eletrônico de Informações";
  const subtitle =
    settings.homepage_esic_subtitle ||
    "Serviço de Informação ao Cidadão — unidade responsável, contato e pedidos via e-SIC";
  const monitoring = settings.sic_monitoring_authority
    ? `Autoridade de monitoramento: ${settings.sic_monitoring_authority}`
    : "Informações sobre unidade responsável, contato e pedidos via e-SIC";

  return (
    <>
      <SeoHead
        title="Acesso à Informação e e-SIC"
        description={`Serviço de Informação ao Cidadão (SIC) da ${orgName}. Endereço, telefone, horário e pedidos via e-SIC.`}
        url="/acesso-a-informacao"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Acesso à Informação" }]} />
        <PageHero
          badge="LAI — Lei 12.527/2011"
          title="Serviço de Informação ao Cidadão"
          subtitle={monitoring}
          centered
        />
        <main id="conteudo" tabIndex={-1} role="main">
          <ESicSection title={title} subtitle={subtitle} hideHeading />
        </main>
        <Footer />
      </div>
    </>
  );
}
