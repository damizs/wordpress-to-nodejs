import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ArrowLeft, Download } from 'lucide-react'

const typeLabels: Record<string, string> = {
  projeto_lei: 'Projeto de Lei', requerimento: 'Requerimento', mocao: 'Moção',
  indicacao: 'Indicação', resolucao: 'Resolução', emenda: 'Emenda',
}

interface Props { activity: any }

export default function ActivityShow({ activity }: Props) {
  return (
    <PublicLayout>
      <Head title={`${typeLabels[activity.type] || activity.type} Nº ${activity.number}/${activity.year} - Câmara de Sumé`} />
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/atividades-legislativas" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <article className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {typeLabels[activity.type] || activity.type} Nº {activity.number}/{activity.year}
            </h1>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`text-sm px-3 py-1 rounded-full ${activity.status === 'aprovado' ? 'bg-green-100 text-green-700' : activity.status === 'rejeitado' ? 'bg-red-100 text-red-600' : activity.status === 'arquivado' ? 'bg-gray-200 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                {activity.status}
              </span>
              {activity.author && <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Autor: {activity.author}</span>}
              {activity.session_date && <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Sessão: {activity.session_date}</span>}
            </div>
            <div className="mb-6">
              <h2 className="font-semibold text-gray-800 mb-2">Ementa</h2>
              <p className="text-gray-700 leading-relaxed">{activity.summary}</p>
            </div>
            {activity.content && (
              <div className="mb-6">
                <h2 className="font-semibold text-gray-800 mb-2">Conteúdo</h2>
                <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: activity.content }} />
              </div>
            )}
            {activity.file_url && (
              <a href={activity.file_url} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-navy border border-navy/20 rounded-lg hover:bg-navy/5">
                <Download className="w-4 h-4" /> Baixar documento
              </a>
            )}
          </article>
        </div>
      </section>
    </PublicLayout>
  )
}
