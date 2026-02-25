import { Link } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import SeoHead from '~/components/SeoHead'
import { ArrowLeft, Download, FileText } from 'lucide-react'

interface Props { publication: any }

export default function PublicationShow({ publication }: Props) {
  return (
    <>
      <SeoHead
        title={`${publication.title} - Publicações Oficiais - Câmara Municipal de Sumé`}
        description={publication.description || publication.title}
        url={`/publicacoes-oficiais/${publication.id}`}
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <main>
          <Breadcrumb items={[
            { label: 'Publicações Oficiais', href: '/publicacoes-oficiais' },
            { label: publication.title }
          ]} />
          
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <Link href="/publicacoes-oficiais" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
              <article className="card-modern p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{publication.title}</h1>
                    {publication.number && <p className="text-sm text-muted-foreground">Nº {publication.number}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full capitalize">{publication.type}</span>
                  <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full">{publication.publication_date}</span>
                </div>
                {publication.description && (
                  <div className="mb-6">
                    <p className="text-muted-foreground leading-relaxed">{publication.description}</p>
                  </div>
                )}
                {publication.file_url && (
                  <a href={publication.file_url} target="_blank" rel="noopener"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    <Download className="w-4 h-4" /> Baixar documento (PDF)
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
