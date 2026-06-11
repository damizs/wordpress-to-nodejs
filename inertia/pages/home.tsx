import { GlobalEffects } from "~/components/GlobalEffects";
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
import { CertificationsSection } from "~/components/CertificationsSection";
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

interface Seal {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
}

interface QuickLinkItem {
  id: number;
  title: string;
  url: string;
  icon: string | null;
  color: string | null;
}

interface InstagramPost {
  id: number;
  title: string;
  excerpt: string;
  image: string | null;
  slug: string | null;
  instagramUrl: string | null;
  date: string;
}

interface GazetteEntry {
  id: number;
  editionNumber: string;
  publicationDate: string;
  description: string | null;
  fileUrl: string | null;
}

interface HomeProps {
  news?: NewsItem[];
  vereadores?: Vereador[];
  publicacoes?: Publicacao[];
  instagramPosts?: InstagramPost[];
  instagramProfileUrl?: string | null;
  quickLinks?: QuickLinkItem[];
  latestGazette?: GazetteEntry | null;
  legislatura?: string;
  newsBackgroundImage?: string | null;
  seals?: Seal[];
  siteSettings?: Record<string, string | null>;
}

export default function Home({ 
  news = [], 
  vereadores = [], 
  publicacoes = [],
  instagramPosts = [],
  instagramProfileUrl = null,
  quickLinks = [],
  latestGazette = null,
  legislatura = "2025-2028",
  newsBackgroundImage = null,
  seals = [],
  siteSettings = {}
}: HomeProps) {
  const logoUrl = siteSettings?.logo_url || null;

  // Módulos da homepage: ativar/desativar pelo painel (Homepage > Visibilidade das Seções).
  // Sem configuração explícita ('false'), a seção fica visível.
  const visible = (section: string) => siteSettings?.[`section_${section}_visible`] !== 'false';
  const setting = (key: string) => {
    const value = siteSettings?.[key];
    return value && value.trim() !== '' ? value : undefined;
  };

  return (
    <>
      <GlobalEffects />
      <SeoHead 
        title="Início"
        description="Portal oficial da Câmara Municipal de Sumé, Paraíba. Acesse informações sobre vereadores, transparência, notícias e serviços ao cidadão."
      />
      
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header logoUrl={logoUrl} />
        
        <main>
          {visible('news') && <NewsSection news={news} backgroundImage={newsBackgroundImage} />}
          {visible('quickaccess') && (
            <QuickAccessSection
              quickLinks={quickLinks}
              badge={setting('homepage_quickaccess_badge')}
              title={setting('homepage_quickaccess_title')}
              subtitle={setting('homepage_quickaccess_subtitle')}
            />
          )}
          {visible('esic') && (
            <ESicSection
              title={setting('homepage_esic_title')}
              subtitle={setting('homepage_esic_subtitle')}
            />
          )}
          {visible('transparency') && (
            <TransparencySection
              title={setting('homepage_transparency_title')}
              subtitle={setting('homepage_transparency_subtitle')}
            />
          )}
          {visible('vereadores') && (
            <VereadoresSection
              vereadores={vereadores}
              legislatura={legislatura}
              title={setting('homepage_vereadores_title')}
              subtitle={setting('homepage_vereadores_subtitle')}
            />
          )}
          {visible('diario') && (
            <DiarioOficialSection
              publicacoes={publicacoes}
              latestGazette={latestGazette}
              title={setting('homepage_diario_title')}
              subtitle={setting('homepage_diario_subtitle')}
            />
          )}
          {visible('instagram') && (
            <InstagramFeedSection posts={instagramPosts} instagramUrl={instagramProfileUrl || siteSettings?.instagram_url || undefined} />
          )}
          {visible('conheca') && (
            <ConhecaSumeSection
              images={siteSettings?.city_images ? JSON.parse(siteSettings.city_images) : []}
              title={setting('homepage_conheca_title')}
              subtitle={setting('homepage_conheca_subtitle')}
            />
          )}
          {visible('seals') && (
            <CertificationsSection
              seals={seals}
              title={setting('homepage_seals_title')}
              subtitle={setting('homepage_seals_subtitle')}
            />
          )}
          {visible('survey') && <SatisfactionSurvey />}
        </main>
        
        <Footer logoUrl={logoUrl} />
        <AssistenteVirtual />
      </div>
    </>
  );
}
