import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { Users2, User } from 'lucide-react'

interface Props { committees: any[] }

export default function CommitteesIndex({ committees }: Props) {
  return (
    <>
      <SeoHead
        title="Comissões Permanentes - Câmara Municipal de Sumé"
        description="Conheça as comissões permanentes da Câmara Municipal de Sumé e seus membros."
        url="/comissoes"
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Comissões Permanentes' }]} />
          <PageTitle title="COMISSÕES PERMANENTES" />

          <section className="py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              {committees.length > 0 ? (
                <div className="space-y-6">
                  {committees.map((c: any) => (
                    <div key={c.id} className="card-modern p-6 md:p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Users2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">{c.name}</h2>
                          {c.abbreviation && (
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              {c.abbreviation}
                            </span>
                          )}
                        </div>
                      </div>
                      {c.description && (
                        <p className="text-sm text-muted-foreground mb-4">{c.description}</p>
                      )}
                      {c.members?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">Membros:</h3>
                          <div className="flex flex-wrap gap-2">
                            {c.members.map((m: any) => (
                              <span key={m.id} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                                {m.councilor?.parliamentary_name || m.councilor?.name || 'Vago'}
                                {m.role && m.role !== 'Membro' && ` (${m.role})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-modern p-12 text-center">
                  <Users2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma comissão cadastrada.</p>
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
