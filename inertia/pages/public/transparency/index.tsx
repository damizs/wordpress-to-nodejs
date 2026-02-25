import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { ExternalLink, Shield, FolderOpen, ArrowRight } from 'lucide-react'

interface Props { sections: any[] }

export default function TransparencyIndex({ sections }: Props) {
  return (
    <>
      <SeoHead
        title="Portal da Transparência - Câmara Municipal de Sumé"
        description="Acesse informações sobre a gestão pública municipal conforme a Lei de Acesso à Informação."
        url="/transparencia"
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Transparência' }]} />
          <PageTitle title="PORTAL DA TRANSPARÊNCIA" />

          <section className="py-12 section-gradient">
            <div className="container mx-auto px-4">
              {/* Intro */}
              <div className="card-modern p-6 md:p-8 mb-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Acesso à Informação</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  O Portal da Transparência da Câmara Municipal de Sumé disponibiliza informações sobre a gestão pública 
                  em cumprimento à Lei de Acesso à Informação (Lei nº 12.527/2011). Aqui você encontra dados sobre 
                  receitas, despesas, contratos, licitações e outras informações de interesse público.
                </p>
              </div>

              {/* Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((s: any) => (
                  <div key={s.id} className="card-modern overflow-hidden">
                    <div className="bg-gradient-hero px-5 py-4">
                      <h3 className="font-bold text-primary-foreground flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" /> {s.title}
                      </h3>
                    </div>
                    <div className="p-4 space-y-1">
                      {s.links?.map((l: any) => (
                        <a
                          key={l.id}
                          href={l.url}
                          target={l.url?.startsWith('http') ? '_blank' : '_self'}
                          rel="noopener"
                          className="group flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="flex-1">{l.title}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </a>
                      ))}
                      {(!s.links || s.links.length === 0) && (
                        <p className="text-sm text-muted-foreground italic px-3 py-2">Nenhum link cadastrado.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {sections.length === 0 && (
                <div className="card-modern p-12 text-center max-w-xl mx-auto">
                  <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Seções de transparência em construção.</p>
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
