import { lazy, Suspense } from 'react'
import SeoHead from '~/components/SeoHead'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { NewsSection } from '~/components/NewsSection'
import { Footer } from '~/components/Footer'

// Lazy load all below-fold sections
const QuickAccessSection = lazy(() => import('~/components/QuickAccessSection').then(m => ({ default: m.QuickAccessSection })))
const ESicSection = lazy(() => import('~/components/ESicSection').then(m => ({ default: m.ESicSection })))
const TransparencySection = lazy(() => import('~/components/TransparencySection').then(m => ({ default: m.TransparencySection })))
const TransparencySealSection = lazy(() => import('~/components/TransparencySealSection').then(m => ({ default: m.TransparencySealSection })))
const VereadoresSection = lazy(() => import('~/components/VereadoresSection').then(m => ({ default: m.VereadoresSection })))
const DiarioOficialSection = lazy(() => import('~/components/DiarioOficialSection').then(m => ({ default: m.DiarioOficialSection })))
const InstagramFeedSection = lazy(() => import('~/components/InstagramFeedSection').then(m => ({ default: m.InstagramFeedSection })))
const ConhecaSumeSection = lazy(() => import('~/components/ConhecaSumeSection').then(m => ({ default: m.ConhecaSumeSection })))
const SatisfactionSurvey = lazy(() => import('~/components/SatisfactionSurvey').then(m => ({ default: m.SatisfactionSurvey })))

interface HomeProps {
  news?: any[]
  councilors?: any[]
  quickLinks?: any[]
  transparencySections?: any[]
  latestGazette?: any
  siteSettings?: Record<string, string | null>
}

export default function Home({ news, councilors, quickLinks, transparencySections, latestGazette, siteSettings }: HomeProps) {
  const s = siteSettings || {}
  const isVisible = (key: string) => s[key] !== 'false'

  return (
    <>
      <SeoHead
        title="Câmara Municipal de Sumé"
        description="Portal oficial da Câmara Municipal de Sumé - PB. Acompanhe notícias, atividades legislativas, transparência pública, vereadores e serviços ao cidadão."
        url="/"
      />
      <div className="min-h-screen bg-background">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-gold focus:text-navy-dark focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium">
          Pular para o conteúdo principal
        </a>
        <TopBar />
        <Header />
        <main id="main-content" role="main">
          {isVisible('section_news_visible') && <NewsSection news={news} />}
          <Suspense fallback={null}>
          {isVisible('section_quickaccess_visible') && (
            <QuickAccessSection
              quickLinks={quickLinks}
              title={s.homepage_quickaccess_title}
              subtitle={s.homepage_quickaccess_subtitle}
              badge={s.homepage_quickaccess_badge}
            />
          )}
          {isVisible('section_esic_visible') && (
            <ESicSection
              settings={{
                title: s.homepage_esic_title,
                subtitle: s.homepage_esic_subtitle,
                address: s.homepage_esic_address,
                hours: s.homepage_esic_hours,
                phone: s.homepage_esic_phone,
                email: s.homepage_esic_email,
                newUrl: s.esic_new_url,
                consultUrl: s.esic_consult_url,
              }}
            />
          )}
          {isVisible('section_transparency_visible') && (
            <TransparencySection
              sections={transparencySections}
              title={s.homepage_transparency_title}
              subtitle={s.homepage_transparency_subtitle}
            />
          )}
          {isVisible('section_vereadores_visible') && (
            <VereadoresSection
              councilors={councilors}
              title={s.homepage_vereadores_title}
              subtitle={s.homepage_vereadores_subtitle}
              badge={s.homepage_vereadores_badge}
            />
          )}
          {isVisible('section_diario_visible') && (
            <DiarioOficialSection
              latestGazette={latestGazette}
              title={s.homepage_diario_title}
              subtitle={s.homepage_diario_subtitle}
            />
          )}
          {isVisible('section_instagram_visible') && <InstagramFeedSection />}
          {isVisible('section_conheca_visible') && (
            <ConhecaSumeSection
              title={s.homepage_conheca_title}
              subtitle={s.homepage_conheca_subtitle}
            />
          )}
          {isVisible('section_seals_visible') && (
            <TransparencySealSection
              title={s.homepage_seals_title}
              subtitle={s.homepage_seals_subtitle}
            />
          )}
          {isVisible('section_survey_visible') && <SatisfactionSurvey />}
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  )
}
