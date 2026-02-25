import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { BookOpen, Calendar } from 'lucide-react'

interface TimelineEvent {
  year: string
  title: string
  description: string
}

interface HistoriaDaCamaraProps {
  timeline?: TimelineEvent[]
  introTitle?: string
  introText?: string
  siteSettings?: Record<string, string | null>
}

const defaultTimeline: TimelineEvent[] = [
  {
    year: "1951",
    title: "Fundação do Município",
    description: "Sumé foi elevado à categoria de município pela Lei Estadual nº 318, desmembrando-se de Monteiro. A partir daí, iniciou-se a formação do Poder Legislativo local.",
  },
  {
    year: "1952",
    title: "Primeiros Legisladores",
    description: "Os primeiros vereadores foram empossados, dando início às atividades legislativas no município, mesmo em condições modestas e sem sede própria.",
  },
  {
    year: "1960",
    title: "Consolidação do Legislativo",
    description: "A Câmara Municipal passou a desempenhar papel fundamental no desenvolvimento do município, aprovando leis que contribuíram para o crescimento de Sumé.",
  },
  {
    year: "1980",
    title: "Nova Sede",
    description: "A Câmara Municipal ganhou sede própria, proporcionando melhores condições para o trabalho legislativo e para o atendimento à população.",
  },
  {
    year: "1988",
    title: "Nova Constituição",
    description: "Com a promulgação da Constituição Federal de 1988, a Câmara de Sumé ampliou suas atribuições, fortalecendo a autonomia municipal e a participação popular.",
  },
  {
    year: "2000",
    title: "Modernização",
    description: "Início do processo de modernização da Câmara, com a informatização dos serviços e maior transparência nas ações legislativas.",
  },
  {
    year: "2020",
    title: "Era Digital",
    description: "A Câmara Municipal de Sumé avançou na transformação digital, com transmissão ao vivo das sessões, portal de transparência e canais digitais de comunicação com o cidadão.",
  },
]

export default function HistoriaDaCamara({ timeline, introTitle, introText, siteSettings }: HistoriaDaCamaraProps) {
  const events = timeline && timeline.length > 0 ? timeline : defaultTimeline
  const title = introTitle || 'Câmara Municipal de Sumé'
  const text = introText || 'A Câmara Municipal de Sumé é o órgão do Poder Legislativo do município de Sumé, no estado da Paraíba. Desde sua fundação, a Câmara tem desempenhado papel fundamental na elaboração de leis, fiscalização do Poder Executivo e representação dos interesses da população sumeense. Ao longo de décadas de história, a Casa Legislativa acompanhou o desenvolvimento do município, contribuindo para avanços nas áreas de educação, saúde, infraestrutura e desenvolvimento social. Hoje, a Câmara segue comprometida com a transparência, a participação popular e a modernização dos processos legislativos.'

  return (
    <>
      <SeoHead
        title="História da Câmara - Câmara Municipal de Sumé"
        description="Conheça a história da Câmara Municipal de Sumé, desde sua fundação até os dias atuais."
        url="/historia-da-camara"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'História da Câmara' }]} />
          <PageTitle title="HISTÓRIA DA CÂMARA" />

          {/* Intro */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="card-modern p-8 md:p-12">
                <div className="flex items-start gap-4 mb-6">
                  <BookOpen className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                      {title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="py-16 md:py-20 section-gradient">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Linha do Tempo
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                  Marcos Históricos
                </h2>
              </div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-gold to-primary/20" />

                {events.map((event, index) => (
                  <div
                    key={index}
                    className={`relative flex flex-col md:flex-row items-start mb-12 last:mb-0 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-6 md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-primary border-4 border-background shadow-glow z-10" />

                    {/* Content */}
                    <div className={`ml-14 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}>
                      <div className="card-modern p-6 hover:shadow-lg transition-shadow duration-300">
                        <span className="inline-block text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                          {event.year}
                        </span>
                        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
