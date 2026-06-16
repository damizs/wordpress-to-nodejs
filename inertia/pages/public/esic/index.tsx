import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { ESicSection } from "~/components/ESicSection";
import { useSiteSettings } from "~/hooks/use_site_settings";

export default function EsicPage() {
  const settings = useSiteSettings();
  const title = settings.homepage_esic_title || "E-SIC - Sistema Eletrônico de Informações";
  const subtitle =
    settings.homepage_esic_subtitle ||
    "Acesse informações públicas e solicite dados da Câmara Municipal de Sumé";

  return (
    <>
      <SeoHead
        title={`${title} - Câmara Municipal de Sumé`}
        description={subtitle}
        url="/esic"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "E-SIC" }]} />
        <main>
          <ESicSection title={title} subtitle={subtitle} />
        </main>
        <Footer />
      </div>
    </>
  );
}
