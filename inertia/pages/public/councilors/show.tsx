import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import SeoHead from '~/components/SeoHead'
import { Mail, Phone, User, GraduationCap, CheckCircle2, Users } from 'lucide-react'

interface Activity {
  id: number
  type: string
  number: string
  year: number
  summary: string
  status: string
}

interface Props {
  councilor: {
    id: number
    name: string
    parliamentary_name?: string
    full_name?: string
    photo_url?: string
    party?: string
    email?: string
    phone?: string
    gender?: string
    marital_status?: string
    education_level?: string
    bio?: string
    history?: string
    positions?: { id: number; position: string; biennium_name: string }[]
    activities?: Activity[]
  }
}

const typeLabels: Record<string, string> = {
  projeto_lei: 'Projeto de Lei',
  projeto_resolucao: 'Projeto de Resolução',
  requerimento: 'Requerimento',
  mocao: 'Moção',
  indicacao: 'Indicação',
  resolucao: 'Resolução',
  emenda: 'Emenda',
}

export default function CouncilorShow({ councilor }: Props) {
  const displayName = councilor.parliamentary_name || councilor.name
  const currentPosition = councilor.positions?.find(p => p.position !== 'Vereador')?.position || 'Vereador'
  const activities = councilor.activities || []

  return (
    <>
      <SeoHead
        title={`${displayName} - Câmara Municipal de Sumé`}
        description={`Perfil do vereador ${displayName} da Câmara Municipal de Sumé. Conheça sua biografia e atividades legislativas.`}
        url={`/vereador/${councilor.id}`}
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[
            { label: 'Vereadores', href: '/vereadores' },
            { label: displayName }
          ]} />

          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  {councilor.full_name || councilor.name}
                </h1>
              </div>

              {/* Info Card */}
              <div className="card-modern p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Foto */}
                  <div className="w-48 h-60 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {councilor.photo_url ? (
                      <img
                        src={councilor.photo_url}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome Parlamentar:</p>
                      <p className="font-semibold text-foreground">{displayName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mandato:</p>
                      <p className="font-semibold text-foreground">{currentPosition}</p>
                    </div>
                    {councilor.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${councilor.email}`} className="text-sm text-foreground hover:text-primary transition-colors">
                          {councilor.email}
                        </a>
                      </div>
                    )}
                    {councilor.marital_status && (
                      <div>
                        <p className="text-sm text-muted-foreground">Estado Civil:</p>
                        <p className="font-semibold text-foreground">{councilor.marital_status}</p>
                      </div>
                    )}
                    {councilor.education_level && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-foreground">{councilor.education_level}</p>
                      </div>
                    )}
                    {councilor.gender && (
                      <div>
                        <p className="text-sm text-muted-foreground">Gênero:</p>
                        <p className="font-semibold text-foreground">{councilor.gender}</p>
                      </div>
                    )}
                    {councilor.party && (
                      <div>
                        <p className="text-sm text-muted-foreground">Partido:</p>
                        <p className="font-semibold text-foreground">{councilor.party}</p>
                      </div>
                    )}
                    {councilor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${councilor.phone}`} className="text-sm text-foreground hover:text-primary transition-colors">
                          {councilor.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Biografia */}
              <div className="card-modern p-6 mb-6">
                <h2 className="font-bold text-foreground mb-2">Biografia:</h2>
                <p className="text-muted-foreground italic whitespace-pre-line">
                  {councilor.bio || 'Biografia não cadastrada até o momento.'}
                </p>
              </div>

              {/* Trajetória */}
              {councilor.history && (
                <div className="card-modern p-6 mb-6">
                  <h2 className="font-bold text-foreground mb-2">Trajetória:</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{councilor.history}</p>
                </div>
              )}

              {/* Atividades Legislativas */}
              <div className="card-modern p-6">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-serif font-bold text-foreground">Atividades Legislativas</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {activities.length} atividades legislativas encontradas para esse vereador
                </p>
                {activities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma atividade registrada.</p>
                ) : (
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((a) => (
                      <div key={a.id} className="border border-border rounded-xl p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full mb-3 ${
                          a.status === 'aprovado' || a.status === 'aprovada' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> {a.status}
                        </span>
                        <h3 className="font-bold text-foreground mb-1">
                          {typeLabels[a.type] || a.type} Nº {a.number}/{a.year}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{a.summary}</p>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            {typeLabels[a.type] || a.type}
                          </span>
                        </div>
                      </div>
                    ))}
                    {activities.length > 5 && (
                      <a
                        href={`/atividades-legislativas?vereador=${councilor.id}`}
                        className="block text-center text-primary hover:underline text-sm font-medium py-4"
                      >
                        Ver todas as {activities.length} atividades
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
