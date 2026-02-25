import { Link } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import SeoHead from '~/components/SeoHead'
import { ArrowLeft, Download, Calendar, FileText } from 'lucide-react'

interface Props { ata: any }

export default function AtaShow({ ata }: Props) {
  return (
    <>
      <SeoHead
        title={`${ata.title} - Atas das Sessões - Câmara Municipal de Sumé`}
        description={ata.description || ata.title}
        url={`/atas/${ata.id}`}
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <main>
          <Breadcrumb items={[
            { label: 'Atas das Sessões', href: '/atas' },
            { label: ata.title }
          ]} />
          
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <Link href="/atas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
              <article className="card-modern p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{ata.title}</h1>
                    {ata.session_date && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ata.session_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  {ata.type && <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full capitalize">{ata.type}</span>}
                  {ata.year && <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">{ata.year}</span>}
                </div>
                
                {ata.description && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-foreground mb-2">Resumo</h2>
                    <p className="text-muted-foreground leading-relaxed">{ata.description}</p>
                  </div>
                )}
                
                {ata.content && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-foreground mb-2">Conteúdo</h2>
                    <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: ata.content }} />
                  </div>
                )}
                
                {ata.file_url && (
                  <a href={ata.file_url} target="_blank" rel="noopener"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    <Download className="w-4 h-4" /> Baixar Ata (PDF)
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
