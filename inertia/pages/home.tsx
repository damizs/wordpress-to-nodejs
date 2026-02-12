import { Head } from '@inertiajs/react'
import { TopBar } from '~/components/sections/TopBar'
import { Header } from '~/components/sections/Header'
import { NewsSection } from '~/components/sections/NewsSection'
import { QuickAccessSection } from '~/components/sections/QuickAccessSection'
import { ESicSection } from '~/components/sections/ESicSection'
import { TransparencySection } from '~/components/sections/TransparencySection'
import { VereadoresSection } from '~/components/sections/VereadoresSection'
import { DiarioOficialSection } from '~/components/sections/DiarioOficialSection'
import { InstagramFeedSection } from '~/components/sections/InstagramFeedSection'
import { ConhecaSumeSection } from '~/components/sections/ConhecaSumeSection'
import { TransparencySealSection } from '~/components/sections/TransparencySealSection'
import { SatisfactionSurvey } from '~/components/sections/SatisfactionSurvey'
import { Footer } from '~/components/sections/Footer'

interface HomeProps {
  news: any[]
  councilors: any[]
  quickLinks: any[]
  transparencySections: any[]
  latestGazette: any | null
}

export default function HomePage({ news, councilors, quickLinks, transparencySections, latestGazette }: HomeProps) {
  return (
    <>
      <Head title="Câmara Municipal de Sumé - Portal Oficial" />
      <TopBar />
      <Header />
      <NewsSection news={news} />
      <QuickAccessSection quickLinks={quickLinks} />
      <ESicSection />
      <TransparencySection sections={transparencySections} />
      <VereadoresSection councilors={councilors} />
      <DiarioOficialSection latestGazette={latestGazette} />
      <InstagramFeedSection />
      <ConhecaSumeSection />
      <TransparencySealSection />
      <SatisfactionSurvey />
      <Footer />
    </>
  )
}
