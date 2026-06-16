import { Fragment } from "react";
import { GlobalEffects } from "~/components/GlobalEffects";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { HolidaysStrip } from "~/components/HolidaysStrip";
import { Footer } from "~/components/Footer";
import { SeoHead } from "~/components/SeoHead";
import { NewsSection } from "~/components/NewsSection";
import { QuickAccessSection } from "~/components/QuickAccessSection";
import { ESicSection } from "~/components/ESicSection";
import { TransparencySection } from "~/components/TransparencySection";
import { VereadoresSection } from "~/components/VereadoresSection";
import { LegislativoSection } from "~/components/LegislativoSection";
import { DiarioOficialSection } from "~/components/DiarioOficialSection";
import { InstagramFeedSection } from "~/components/InstagramFeedSection";
import { ReelsSection } from "~/components/ReelsSection";
import type { ReelItem } from "~/components/ReelsGallery";
import { ConhecaSumeSection } from "~/components/ConhecaSumeSection";
import { CertificationsSection } from "~/components/CertificationsSection";
import { SatisfactionSurvey } from "~/components/SatisfactionSurvey";
import { AssistenteVirtual } from "~/components/AssistenteVirtual";
import { HomeHero } from "~/components/HomeHero";
import { getSiteTemplate } from "~/lib/templates";

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

interface InfoCategory {
  id: number;
  name: string;
  slug: string;
}

interface LegislativoData {
  weekly: { label: string; count: number }[];
  materias: { id: number; titulo: string; data: string; url: string }[];
  vereadores: { id: number; nome: string; cargo: string; foto: string | null; slug: string; materias: number }[];
  totalMateriasAno: number;
  totalSessoesAno: number;
  ano: number;
}

interface HomeProps {
  news?: NewsItem[];
  vereadores?: Vereador[];
  legislativo?: LegislativoData | null;
  publicacoes?: Publicacao[];
  instagramPosts?: InstagramPost[];
  instagramReels?: ReelItem[];
  instagramProfileUrl?: string | null;
  quickLinks?: QuickLinkItem[];
  latestGazette?: GazetteEntry | null;
  gazetteEntries?: GazetteEntry[];
  gazetteDates?: { date: string; editionNumber: string; fileUrl: string | null }[];
  legislatura?: string;
  newsBackgroundImage?: string | null;
  seals?: Seal[];
  infoCategories?: InfoCategory[];
  siteSettings?: Record<string, string | null>;
}

export default function Home({ 
  news = [], 
  vereadores = [], 
  legislativo = null,
  instagramPosts = [],
  instagramReels = [],
  instagramProfileUrl = null,
  quickLinks = [],
  latestGazette = null,
  gazetteEntries = [],
  gazetteDates = [],
  legislatura = "2025-2028",
  newsBackgroundImage = null,
  seals = [],
  infoCategories = [],
  siteSettings = {}
}: HomeProps) {
  const logoUrl = siteSettings?.logo_url || null;
  const template = getSiteTemplate(siteSettings?.site_template);
  const featuredNews = news[0]
    ? { title: news[0].title, excerpt: news[0].excerpt, image: news[0].image, slug: news[0].slug }
    : null;

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
          {template.homeHero && <HomeHero template={template.key} featured={featuredNews} />}
          <HolidaysStrip />
          {/* Seções renderizadas na ordem do modelo (template.homeOrder); cada uma
              respeita a visibilidade configurada no painel (section_*_visible). */}
          {template.homeOrder.map((key) => {
            if (!visible(key)) return null;
            const node = {
              news: <NewsSection news={news} backgroundImage={newsBackgroundImage} layout={siteSettings?.news_layout} />,
              quickaccess: (
                <QuickAccessSection
                  quickLinks={quickLinks}
                  badge={setting('homepage_quickaccess_badge')}
                  title={setting('homepage_quickaccess_title')}
                  subtitle={setting('homepage_quickaccess_subtitle')}
                />
              ),
              esic: (
                <ESicSection
                  title={setting('homepage_esic_title')}
                  subtitle={setting('homepage_esic_subtitle')}
                />
              ),
              transparency: (
                <TransparencySection
                  categories={infoCategories}
                  title={setting('homepage_transparency_title')}
                  subtitle={setting('homepage_transparency_subtitle')}
                />
              ),
              vereadores: (
                <VereadoresSection
                  vereadores={vereadores}
                  legislatura={legislatura}
                  title={setting('homepage_vereadores_title')}
                  subtitle={setting('homepage_vereadores_subtitle')}
                />
              ),
              legislativo: (
                <LegislativoSection
                  data={legislativo}
                  title={setting('homepage_legislativo_title')}
                  subtitle={setting('homepage_legislativo_subtitle')}
                />
              ),
              diario: (
                <DiarioOficialSection
                  latestGazette={latestGazette}
                  entries={gazetteEntries}
                  gazetteDates={gazetteDates}
                  title={setting('homepage_diario_title')}
                  subtitle={setting('homepage_diario_subtitle')}
                />
              ),
              instagram: (
                <InstagramFeedSection
                  posts={instagramPosts}
                  instagramUrl={instagramProfileUrl || siteSettings?.instagram_url || undefined}
                />
              ),
              reels: (
                <ReelsSection
                  reels={instagramReels}
                  title={setting('homepage_reels_title')}
                  subtitle={setting('homepage_reels_subtitle')}
                />
              ),
              conheca: (
                <ConhecaSumeSection
                  images={siteSettings?.city_images ? JSON.parse(siteSettings.city_images) : []}
                  title={setting('homepage_conheca_title')}
                  subtitle={setting('homepage_conheca_subtitle')}
                />
              ),
              seals: (
                <CertificationsSection
                  seals={seals}
                  title={setting('homepage_seals_title')}
                  subtitle={setting('homepage_seals_subtitle')}
                />
              ),
              survey: <SatisfactionSurvey />,
            }[key];
            return <Fragment key={key}>{node}</Fragment>;
          })}
        </main>
        
        <Footer logoUrl={logoUrl} />
        <AssistenteVirtual />
      </div>
    </>
  );
}
