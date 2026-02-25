import { Link } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import SeoHead from '~/components/SeoHead'
import { ArrowLeft, Download, Calendar, ClipboardList } from 'lucide-react'

interface Props { pauta: any }

export default function PautaShow({ pauta }: Props) {
  return (
    <>
      <SeoHead
        title={`${pauta.title} - Pautas - Câmara Municipal de Sumé`}
        description={pauta.description || pauta.title}
        url={`/pautas/${pauta.id}`}
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />
        <main>
          <Breadcrumb items={[
            { label: 'Pautas', href: '/pautas' },
            { label: pauta.title }
          ]} />
          
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <Link href="/pautas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
              <article className="card-modern p-8 border-t-4 border-t-primary">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{pauta.title}</h1>
                    {pauta.session_date && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(pauta.session_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  {pauta.year && <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">{pauta.year}</span>}
                </div>
                
                {pauta.description && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-foreground mb-2">Descrição</h2>
                    <p className="text-muted-foreground leading-relaxed">{pauta.description}</p>
                  </div>
                )}
                
                {pauta.content && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-foreground mb-2">Itens da Pauta</h2>
                    <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: pauta.content }} />
                  </div>
                )}
                
                {pauta.file_url && (
                  <a href={pauta.file_url} target="_blank" rel="noopener"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    <Download className="w-4 h-4" /> Baixar Pauta (PDF)
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
