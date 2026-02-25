import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { Users, Users2 } from 'lucide-react'

interface Props { councilors: any[]; legislature: any | null }

export default function CouncilorsIndex({ councilors, legislature }: Props) {
  return (
    <>
      <SeoHead
        title="Vereadores - Câmara Municipal de Sumé"
        description="Conheça os vereadores da Câmara Municipal de Sumé. Veja a composição da legislatura atual."
        url="/vereadores"
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Vereadores' }]} />
          <PageTitle title="VEREADORES" />
          
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users2 className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-primary">
                  {legislature ? `LEGISLATURA ${legislature.name}` : 'LEGISLATURA ATUAL'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {councilors.map((c: any) => (
                  <a 
                    key={c.id} 
                    href={`/vereadores/${c.slug || c.id}`}
                    className="group"
                  >
                    <div className="card-modern overflow-hidden">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <span className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
                          EM EXERCÍCIO
                        </span>
                        {c.photo_url ? (
                          <img 
                            src={c.photo_url} 
                            alt={c.parliamentary_name || c.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-navy/5">
                            <Users className="w-16 h-16 text-navy/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-foreground text-sm leading-tight mb-1 line-clamp-2">
                          {(c.parliamentary_name || c.name)?.toUpperCase()}
                        </h3>
                        {c.party && <p className="text-muted-foreground text-sm">{c.party}</p>}
                        {c.position && (
                          <span className="inline-block mt-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-xs font-semibold rounded-full">
                            {c.position}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {councilors.length === 0 && (
                <div className="card-modern p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum vereador cadastrado.</p>
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
