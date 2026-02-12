import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ArrowLeft, Download, FileText } from 'lucide-react'

interface Props { publication: any }

export default function PublicationShow({ publication }: Props) {
  return (
    <PublicLayout>
      <Head title={`${publication.title} - Publicações Oficiais - Câmara de Sumé`} />
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/publicacoes-oficiais" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <article className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-red-500" /></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{publication.title}</h1>
                {publication.number && <p className="text-sm text-gray-400">Nº {publication.number}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">{publication.type}</span>
              <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{publication.publication_date}</span>
            </div>
            {publication.description && (
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{publication.description}</p>
              </div>
            )}
            {publication.file_url && (
              <a href={publication.file_url} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-navy border border-navy/20 rounded-lg hover:bg-navy/5">
                <Download className="w-4 h-4" /> Baixar documento (PDF)
              </a>
            )}
          </article>
        </div>
      </section>
    </PublicLayout>
  )
}
