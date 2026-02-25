import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { SeoHead } from "~/components/SeoHead";
import { NewsSection } from "~/components/NewsSection";
import { QuickAccessSection } from "~/components/QuickAccessSection";
import { ESicSection } from "~/components/ESicSection";
import { TransparencySection } from "~/components/TransparencySection";
import { VereadoresSection } from "~/components/VereadoresSection";
import { DiarioOficialSection } from "~/components/DiarioOficialSection";
import { InstagramFeedSection } from "~/components/InstagramFeedSection";
import { ConhecaSumeSection } from "~/components/ConhecaSumeSection";
import { TransparencySealSection } from "~/components/TransparencySealSection";
import { SatisfactionSurvey } from "~/components/SatisfactionSurvey";
import { AssistenteVirtual } from "~/components/AssistenteVirtual";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
  slug: string;
  featured?: boolean;
}

interface Vereador {
  id: number;
  nome: string;
  apelido: string;
  cargo: string;
  foto: string | null;
  slug: string;
  ativo: boolean;
}

interface Publicacao {
  id: number;
  titulo: string;
  data: string;
  tipo: string;
  arquivo: string | null;
}

interface HomeProps {
  news?: NewsItem[];
  vereadores?: Vereador[];
  publicacoes?: Publicacao[];
  legislatura?: string;
  newsBackgroundImage?: string | null;
}

export default function Home({ 
  news = [], 
  vereadores = [], 
  publicacoes = [],
  legislatura = "2025-2028",
  newsBackgroundImage = null
}: HomeProps) {
  return (
    <>
      <SeoHead 
        title="Início"
        description="Portal oficial da Câmara Municipal de Sumé, Paraíba. Acesse informações sobre vereadores, transparência, notícias e serviços ao cidadão."
      />
      
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        
        <main>
          <NewsSection news={news} backgroundImage={newsBackgroundImage} />
          <QuickAccessSection />
          <ESicSection />
          <TransparencySection />
          <VereadoresSection vereadores={vereadores} legislatura={legislatura} />
          <DiarioOficialSection publicacoes={publicacoes} />
          <InstagramFeedSection />
          <ConhecaSumeSection />
          <TransparencySealSection />
          <SatisfactionSurvey />
        </main>
        
        <Footer />
        <AssistenteVirtual />
      </div>
    </>
  );
}
