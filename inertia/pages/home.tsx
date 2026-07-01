import { Fragment, type ReactNode } from "react";
import { usePage } from "@inertiajs/react";
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
import { MesaDiretoraSection, type MesaMember } from "~/components/MesaDiretoraSection";
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
import { HomeSectionShell } from "~/components/HomeSectionShell";
import { getSiteTemplate } from "~/lib/templates";
import {
  getTemplateCustomConfig,
  parseTemplateConfig,
} from "~/lib/template-config";
import { ElectionModeNotice } from "~/components/ElectionModeNotice";

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
  publicationDate?: string;
  tipo: string;
  arquivo: string | null;
  url?: string;
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
  mesaDiretora?: { members: MesaMember[]; biennium: string | null };
  publicacoes?: Publicacao[];
  instagramPosts?: InstagramPost[];
  instagramReels?: ReelItem[];
  instagramProfileUrl?: string | null;
  instagramProfilePic?: string | null;
  quickLinks?: QuickLinkItem[];
  latestGazette?: GazetteEntry | null;
  gazetteEntries?: GazetteEntry[];
  gazetteDates?: { date: string; editionNumber: string; fileUrl: string | null }[];
  legislatura?: string;
  newsBackgroundImage?: string | null;
  seals?: Seal[];
  infoCategories?: InfoCategory[];
  siteSettings?: Record<string, string | null>;
  electionMode?: { active: boolean; message: string };
}

export default function Home({ 
  news = [],
  vereadores = [],
  legislativo = null,
  mesaDiretora = { members: [], biennium: null },
  publicacoes = [],
  instagramPosts = [],
  instagramReels = [],
  instagramProfileUrl = null,
  instagramProfilePic = null,
  quickLinks = [],
  latestGazette = null,
  gazetteEntries = [],
  gazetteDates = [],
  legislatura = "2025-2028",
  newsBackgroundImage = null,
  seals = [],
  infoCategories = [],
  siteSettings = {},
  electionMode = undefined,
}: HomeProps) {
  // Identidade da câmara vem dos shared props do Inertia (config/camara).
  // Usada para montar SEO/H1 sem chumbar nome/cidade/UF de nenhuma câmara.
  const camara = (usePage().props as {
    camara?: { nome: string; cidade: string; uf: string };
  }).camara;
  const camaraNome = camara?.nome ?? "";
  const camaraCidade = camara?.cidade ?? "";
  const camaraUf = camara?.uf ?? "";
  const logoUrl = siteSettings?.logo_url || null;
  const template = getSiteTemplate(siteSettings?.site_template);
  const templateConfig = parseTemplateConfig(siteSettings?.template_config);
  const customConfig = getTemplateCustomConfig(templateConfig, template.key);
  // Ordem das seções: o modelo de site define a ordem base; o painel
  // (Homepage > Reordenar seções) pode sobrescrever via `section_order` (JSON).
  // Mantém só chaves válidas do modelo atual e anexa as não listadas ao fim.
  const homeOrder = (() => {
    const base = customConfig.homeOrder;
    let saved: string[] | null = null;
    try {
      const parsed = JSON.parse(siteSettings?.section_order || "null");
      if (Array.isArray(parsed)) saved = parsed;
    } catch {
      saved = null;
    }
    if (!saved) return base;
    const ordered = saved.filter((k) => (base as readonly string[]).includes(k));
    const rest = base.filter((k) => !ordered.includes(k));
    const bannerFirst = rest.filter((key) => key === 'banner');
    const remaining = rest.filter((key) => key !== 'banner');
    return [...bannerFirst, ...ordered, ...remaining] as typeof base;
  })();
  const newsLimit = Math.min(
    12,
    Math.max(3, Number(siteSettings?.news_count || customConfig.newsCount || 5))
  );
  const newsLayout = siteSettings?.news_layout || customConfig.newsLayout || "mosaico";
  const newsForHome = news.slice(0, newsLimit);
  const electionActive = electionMode?.active ?? false;
  const electionNotice = electionMode?.message ?? null;
  const setting = (key: string) => {
    const value = siteSettings?.[key];
    return value && value.trim() !== '' ? value : undefined;
  };
  const electionHiddenSections = new Set([
    "banner",
    "news",
    "instagram",
    "reels",
    "conheca",
    "seals",
    "survey",
  ]);
  const bannerImage = setting('banner_image');
  const bannerLink = normalizePublicLink(setting('banner_link'));

  const hasDiarioSectionContent = Boolean(
    latestGazette || publicacoes.length || gazetteEntries.length || gazetteDates.length
  );

  // Módulos da homepage: ativar/desativar pelo painel (Homepage > Visibilidade das Seções).
  // Sem configuração explícita ('false'), a seção fica visível. O Diário Oficial é
  // alimentado por importador próprio e deve voltar à home sempre que houver publicações.
  const visible = (section: string) => {
    if (electionActive && electionHiddenSections.has(section)) return false;
    if (section === 'banner') {
      return Boolean(bannerImage) && siteSettings?.section_banner_visible === 'true';
    }
    if (section === 'diario' && hasDiarioSectionContent) return true;
    return siteSettings?.[`section_${section}_visible`] !== 'false';
  };

  return (
    <>
      <GlobalEffects />
      <SeoHead
        title="Início"
        description={`Portal oficial da ${camaraNome}, ${camaraCidade} - ${camaraUf}. Transparência, notícias, vereadores e serviços ao cidadão.`}
      />
      
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header logoUrl={logoUrl} />
        
        <main id="conteudo" tabIndex={-1} className="outline-none">
          <h1 className="sr-only">{camaraNome} — Portal Oficial</h1>
          {template.homeHero && !electionActive && (
            <HomeHero
              template={template.key}
              quickLinks={quickLinks}
              legislativo={legislativo}
              legislatura={legislatura}
              title={setting('homepage_hero_title')}
              subtitle={setting('homepage_hero_subtitle')}
            />
          )}
          <HolidaysStrip />
          {electionActive && (
            <section className="py-8">
              <div className="container">
                <ElectionModeNotice message={electionNotice} />
              </div>
            </section>
          )}
          {homeOrder.map((key) => {
            if (!visible(key)) return null;

            const shell = (node: ReactNode) => (
              <HomeSectionShell style={customConfig.sections[key]}>
                {node}
              </HomeSectionShell>
            );

            const node = {
              banner: bannerImage
                ? shell(<HomeBannerSection imageUrl={bannerImage} linkUrl={bannerLink} />)
                : null,
              news: shell(
                <NewsSection
                  news={newsForHome}
                  backgroundImage={template.homeHero ? null : newsBackgroundImage}
                  bannerImage={null}
                  layout={newsLayout}
                  limit={newsLimit}
                />
              ),
              quickaccess: shell(
                <QuickAccessSection
                  quickLinks={quickLinks}
                  badge={setting('homepage_quickaccess_badge')}
                  title={setting('homepage_quickaccess_title')}
                  subtitle={setting('homepage_quickaccess_subtitle')}
                />
              ),
              esic: shell(
                <ESicSection
                  title={setting('homepage_esic_title')}
                  subtitle={setting('homepage_esic_subtitle')}
                />
              ),
              transparency: shell(
                <TransparencySection
                  categories={infoCategories}
                  title={setting('homepage_transparency_title')}
                  subtitle={setting('homepage_transparency_subtitle')}
                />
              ),
              vereadores: shell(
                <VereadoresSection
                  vereadores={vereadores}
                  legislatura={legislatura}
                  title={setting('homepage_vereadores_title')}
                  subtitle={setting('homepage_vereadores_subtitle')}
                />
              ),
              mesa: shell(
                <MesaDiretoraSection
                  members={mesaDiretora.members}
                  biennium={mesaDiretora.biennium}
                  title={setting('homepage_mesa_title')}
                  subtitle={setting('homepage_mesa_subtitle')}
                />
              ),
              legislativo: shell(
                <LegislativoSection
                  data={legislativo}
                  title={setting('homepage_legislativo_title')}
                  subtitle={setting('homepage_legislativo_subtitle')}
                />
              ),
              diario: shell(
                <DiarioOficialSection
                  latestGazette={latestGazette}
                  entries={publicacoes}
                  gazetteDates={gazetteDates}
                  title={setting('homepage_diario_title')}
                  subtitle={setting('homepage_diario_subtitle')}
                />
              ),
              instagram: shell(
                <InstagramFeedSection
                  posts={instagramPosts}
                  instagramUrl={instagramProfileUrl || siteSettings?.instagram_url || undefined}
                  profileImageUrl={instagramProfilePic}
                />
              ),
              reels: shell(
                <ReelsSection
                  reels={instagramReels}
                  title={setting('homepage_reels_title')}
                  subtitle={setting('homepage_reels_subtitle')}
                />
              ),
              conheca: shell(
                <ConhecaSumeSection
                  images={siteSettings?.city_images ? JSON.parse(siteSettings.city_images) : []}
                  title={setting('homepage_conheca_title')}
                  subtitle={setting('homepage_conheca_subtitle')}
                />
              ),
              seals: shell(
                <CertificationsSection
                  seals={seals}
                  title={setting('homepage_seals_title')}
                  subtitle={setting('homepage_seals_subtitle')}
                />
              ),
              survey: shell(<SatisfactionSurvey />),
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

function normalizePublicLink(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith('/')) return value;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}

function HomeBannerSection({ imageUrl, linkUrl }: { imageUrl: string; linkUrl?: string }) {
  const image = (
    <img
      src={imageUrl}
      alt="Banner institucional"
      className="h-full w-full object-cover"
      loading="lazy"
    />
  );

  return (
    <section className="py-8 sm:py-10">
      <div className="container">
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-lg bg-muted">
          <div className="aspect-[4/5]">
            {linkUrl ? (
              <a
                href={linkUrl}
                className="block h-full w-full"
                target={linkUrl.startsWith('/') ? undefined : '_blank'}
                rel={linkUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
              >
                {image}
              </a>
            ) : (
              image
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
