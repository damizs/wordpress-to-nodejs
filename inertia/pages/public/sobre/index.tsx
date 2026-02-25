import SeoHead from '~/components/SeoHead'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import { Building2, Users, Target, Award } from 'lucide-react'

export default function Sobre() {
  return (
    <>
      <SeoHead
        title="Sobre a Câmara | Câmara Municipal de Sumé"
        description="Conheça a Câmara Municipal de Sumé, sua missão, visão e estrutura organizacional."
        url="/sobre"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: "Sobre a Câmara" }]} />
          <PageTitle title="SOBRE A CÂMARA" />

          {/* Introdução */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="card-modern p-8 md:p-12">
                <div className="flex items-start gap-4 mb-6">
                  <Building2 className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                      Câmara Municipal de Sumé
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      A Câmara Municipal de Sumé é o órgão do Poder Legislativo do município, responsável 
                      pela elaboração de leis, fiscalização do Poder Executivo e representação dos interesses 
                      da população sumeense.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Localizada no coração do Cariri Paraibano, a Casa Legislativa trabalha diariamente 
                      para promover o desenvolvimento do município, garantindo a transparência nas ações 
                      públicas e a participação popular no processo legislativo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Missão, Visão, Valores */}
          <section className="py-16 md:py-20 section-gradient">
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Missão */}
                <div className="card-modern p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">Missão</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Legislar, fiscalizar e representar os interesses da população sumeense, 
                    promovendo o desenvolvimento sustentável do município através de ações 
                    transparentes e participativas.
                  </p>
                </div>

                {/* Visão */}
                <div className="card-modern p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">Visão</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Ser reconhecida como uma Casa Legislativa moderna, eficiente e comprometida 
                    com a transparência, a ética e o bem-estar da comunidade sumeense.
                  </p>
                </div>

                {/* Valores */}
                <div className="card-modern p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">Valores</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Transparência, ética, responsabilidade social, respeito ao cidadão, 
                    compromisso com a lei e promoção da participação popular.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Composição */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Composição
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                  Estrutura Organizacional
                </h2>
              </div>

              <div className="card-modern p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Legislatura Atual</h3>
                    <p className="text-muted-foreground text-sm">
                      A atual legislatura (2025-2028) é composta por 9 vereadores eleitos 
                      democraticamente para representar os interesses da população sumeense.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Mesa Diretora</h3>
                    <p className="text-muted-foreground text-sm">
                      A Mesa Diretora é o órgão de direção da Câmara, responsável pela administração 
                      e condução dos trabalhos legislativos. É composta por Presidente, Vice-Presidente, 
                      1º e 2º Secretários.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Comissões Permanentes</h3>
                    <p className="text-muted-foreground text-sm">
                      As comissões permanentes são responsáveis por analisar e emitir pareceres sobre 
                      proposições legislativas em suas áreas de competência.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a 
                    href="/vereadores" 
                    className="btn-modern bg-primary text-primary-foreground"
                  >
                    Conhecer Vereadores
                  </a>
                  <a 
                    href="/mesa-diretora" 
                    className="btn-modern bg-muted text-foreground hover:bg-muted/80"
                  >
                    Mesa Diretora
                  </a>
                  <a 
                    href="/historia-da-camara" 
                    className="btn-modern bg-muted text-foreground hover:bg-muted/80"
                  >
                    História da Câmara
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
