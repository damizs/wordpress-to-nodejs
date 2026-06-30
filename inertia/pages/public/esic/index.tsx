import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { ESicSection } from "~/components/ESicSection";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { usePage } from "@inertiajs/react";

export default function EsicPage() {
  const settings = useSiteSettings();
  const camara = (usePage().props as { camara?: { nome: string } }).camara;
  const orgNome = camara?.nome || "Câmara Municipal";
  const title = settings.homepage_esic_title || "E-SIC - Sistema Eletrônico de Informações";
  const subtitle =
    settings.homepage_esic_subtitle ||
    `Acesse informações públicas e solicite dados da ${orgNome}`;

  return (
    <>
      <SeoHead
        title={`${title} - ${orgNome}`}
        description={subtitle}
        url="/esic"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "E-SIC" }]} />
        <main id="conteudo" tabIndex={-1} role="main">
          <ESicSection title={title} subtitle={subtitle} />
        </main>
        <Footer />
      </div>
    </>
  );
}
