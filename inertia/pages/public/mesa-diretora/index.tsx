import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { Crown, Users, Users2 } from 'lucide-react'

interface Props { biennium: any; legislature_name: string; positions: any[] }

const cargoColors: Record<string, string> = {
  'Presidente': 'from-primary to-primary/80',
  'Vice-Presidente': 'from-sky to-sky/80',
  '1º Secretário': 'from-gold to-gold/80',
  '2º Secretário': 'from-emerald-500 to-emerald-600',
}

const competencias = [
  { cargo: 'Presidente', desc: 'Representa a Câmara, preside as sessões e coordena os trabalhos legislativos e administrativos.' },
  { cargo: 'Vice-Presidente', desc: 'Substitui o Presidente em suas ausências e presta apoio na condução das atividades da Mesa.' },
  { cargo: '1º Secretário', desc: 'Atua na organização das sessões, leitura de documentos e supervisão da Secretaria Legislativa.' },
  { cargo: '2º Secretário', desc: 'Auxilia o 1º Secretário e o substitui quando necessário.' },
]

export default function MesaDiretoraIndex({ biennium, legislature_name, positions }: Props) {
  return (
    <>
      <SeoHead
        title="Mesa Diretora - Câmara Municipal de Sumé"
        description="Conheça a composição da Mesa Diretora da Câmara Municipal de Sumé."
        url="/mesa-diretora"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Mesa Diretora' }]} />
          <PageTitle title="MESA DIRETORA" />

          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              {biennium && (
                <p className="text-center text-muted-foreground mb-8">
                  Biênio {biennium.name} • {legislature_name}
                </p>
              )}

              {positions.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {positions.map((p: any) => {
                      const colorClass = cargoColors[p.position] || 'from-gray-500 to-gray-600'
                      return (
                        <a
                          key={p.id}
                          href={`/vereadores/${p.councilor?.slug || p.councilor?.id}`}
                          className="group"
                        >
                          <div className="card-modern overflow-hidden">
                            <div className="relative aspect-[3/4] overflow-hidden">
                              <span className={`absolute top-4 left-4 z-10 px-3 py-1.5 bg-gradient-to-r ${colorClass} text-white text-xs font-bold rounded-full shadow-lg`}>
                                {p.position.toUpperCase()}
                              </span>
                              {p.councilor?.photo_url ? (
                                <img
                                  src={p.councilor.photo_url}
                                  alt={p.councilor.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Users className="w-16 h-16 text-muted-foreground/30" />
                                </div>
                              )}
                            </div>
                            <div className="p-5">
                              <h3 className="font-bold text-foreground text-sm leading-tight mb-1 line-clamp-2">
                                {p.councilor?.full_name || p.councilor?.name || 'Vago'}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                {p.councilor?.parliamentary_name || ''}
                              </p>
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>

                  {/* Competências */}
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users2 className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-serif font-bold text-foreground">Competências</h2>
                    </div>
                    <div className="card-modern p-6 md:p-8">
                      <ul className="space-y-4">
                        {competencias.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                            <p className="text-foreground"><strong>{c.cargo}:</strong> {c.desc}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card-modern p-12 text-center max-w-xl mx-auto">
                  <Crown className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Mesa Diretora ainda não cadastrada.</p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
