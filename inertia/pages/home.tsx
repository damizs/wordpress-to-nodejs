import { Head } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { NewsSection } from '~/components/NewsSection'
import { QuickAccessSection } from '~/components/QuickAccessSection'
import { ESicSection } from '~/components/ESicSection'
import { TransparencySection } from '~/components/TransparencySection'
import { TransparencySealSection } from '~/components/TransparencySealSection'
import { VereadoresSection } from '~/components/VereadoresSection'
import { DiarioOficialSection } from '~/components/DiarioOficialSection'
import { InstagramFeedSection } from '~/components/InstagramFeedSection'
import { ConhecaSumeSection } from '~/components/ConhecaSumeSection'
import { SatisfactionSurvey } from '~/components/SatisfactionSurvey'
import { Footer } from '~/components/Footer'

interface HomeProps {
  news?: any[];
  councilors?: any[];
  quickLinks?: any[];
  transparencySections?: any[];
  latestGazette?: any;
}

export default function Home({ news }: HomeProps) {
  return (
    <>
      <Head title="Câmara Municipal de Sumé - Portal Oficial" />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <main>
          <NewsSection news={news} />
          <QuickAccessSection />
          <ESicSection />
          <TransparencySection />
          <VereadoresSection />
          <DiarioOficialSection />
          <InstagramFeedSection />
          <ConhecaSumeSection />
          <TransparencySealSection />
          <SatisfactionSurvey />
        </main>
        <Footer />
      </div>
    </>
  )
}
