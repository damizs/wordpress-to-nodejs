import { Link } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import SeoHead from '~/components/SeoHead'
import { ArrowLeft, Download, Gavel, Calendar, FileText } from 'lucide-react'

const statusLabels: Record<string, string> = { aberta: 'Aberta', encerrada: 'Encerrada', em_andamento: 'Em andamento', suspensa: 'Suspensa', cancelada: 'Cancelada', deserta: 'Deserta' }
const modalityLabels: Record<string, string> = { pregao: 'Pregão', tomada_precos: 'Tomada de Preços', concorrencia: 'Concorrência', convite: 'Convite', dispensa: 'Dispensa', inexigibilidade: 'Inexigibilidade' }

interface Props { licitacao: any }

export default function LicitacaoShow({ licitacao }: Props) {
  return (
    <>
      <SeoHead
        title={`${licitacao.title} - Licitações - Câmara Municipal de Sumé`}
        description={licitacao.description || licitacao.title}
        url={`/licitacoes/${licitacao.id}`}
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />
        <main>
          <Breadcrumb items={[
            { label: 'Licitações', href: '/licitacoes' },
            { label: licitacao.title }
          ]} />
          
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <Link href="/licitacoes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
              <article className="card-modern p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center">
                    <Gavel className="w-7 h-7 text-gold" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{licitacao.title}</h1>
                    <p className="text-muted-foreground">{modalityLabels[licitacao.modality] || licitacao.modality}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                    licitacao.status === 'aberta' ? 'bg-green-100 text-green-700' :
                    licitacao.status === 'encerrada' ? 'bg-gray-200 text-gray-600' :
                    licitacao.status === 'cancelada' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {statusLabels[licitacao.status] || licitacao.status}
                  </span>
                  {licitacao.opening_date && (
                    <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Abertura: {new Date(licitacao.opening_date).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                
                {licitacao.description && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-foreground mb-2">Objeto</h2>
                    <p className="text-muted-foreground leading-relaxed">{licitacao.description}</p>
                  </div>
                )}
                
                {licitacao.file_url && (
                  <a href={licitacao.file_url} target="_blank" rel="noopener"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    <Download className="w-4 h-4" /> Baixar Edital (PDF)
                  </a>
                )}
              </article>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}
