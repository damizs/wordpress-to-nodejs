import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ScrollText } from 'lucide-react'

interface Props { activities: any; filters: { type: string; year: string } }

const typeLabels: Record<string, string> = {
  projeto_lei: 'Projeto de Lei',
  requerimento: 'Requerimento',
  mocao: 'Moção',
  indicacao: 'Indicação',
  resolucao: 'Resolução',
  emenda: 'Emenda',
}

export default function ActivitiesIndex({ activities, filters }: Props) {
  return (
    <PublicLayout>
      <Head title="Atividades Legislativas - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Atividades Legislativas</h1>
            <p className="text-gray-500 mt-2">Projetos de lei, requerimentos, moções e demais atos</p>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            <select value={filters.type} onChange={(e) => router.get('/atividades-legislativas', { ...filters, tipo: e.target.value }, { preserveState: true })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Todos os tipos</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select value={filters.year} onChange={(e) => router.get('/atividades-legislativas', { ...filters, ano: e.target.value }, { preserveState: true })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Todos os anos</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {activities.data?.map((a: any) => (
              <Link key={a.id} href={`/atividades-legislativas/${a.id}`}
                className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ScrollText className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {typeLabels[a.type] || a.type} Nº {a.number}/{a.year}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {a.author && <span className="text-xs text-gray-400">Autor: {a.author}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === 'aprovado' ? 'bg-green-100 text-green-700' : a.status === 'rejeitado' ? 'bg-red-100 text-red-600' : a.status === 'arquivado' ? 'bg-gray-200 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{a.summary}</p>
                  </div>
                </div>
              </Link>
            ))}
            {(!activities.data || activities.data.length === 0) && (
              <p className="text-center text-gray-400 py-12">Nenhuma atividade encontrada.</p>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
