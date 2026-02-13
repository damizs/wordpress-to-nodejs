import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { ScrollText, Filter, Calendar } from 'lucide-react'

interface Props { activities: any; filters: { type: string; year: string } }

const typeLabels: Record<string, string> = {
  projeto_lei: 'Projeto de Lei', requerimento: 'Requerimento', mocao: 'Moção',
  indicacao: 'Indicação', resolucao: 'Resolução', emenda: 'Emenda',
}

export default function ActivitiesIndex({ activities, filters }: Props) {
  return (
    <PublicLayout>
      <Head title="Atividades Legislativas - Câmara de Sumé" />
      <PageHero
        title="Atividades Legislativas"
        subtitle="Projetos de lei, requerimentos, moções e demais atos legislativos"
        icon={<ScrollText className="w-8 h-8" />}
        breadcrumbs={[{ label: 'Atividades Legislativas' }]}
      />
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-4 mb-6 flex gap-3 flex-wrap items-center">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filters.type} onChange={(e) => router.get('/atividades-legislativa', { ...filters, tipo: e.target.value }, { preserveState: true })}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none">
              <option value="">Todos os tipos</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select value={filters.year} onChange={(e) => router.get('/atividades-legislativa', { ...filters, ano: e.target.value }, { preserveState: true })}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none">
              <option value="">Todos os anos</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {activities.data?.map((a: any) => (
              <Link key={a.id} href={`/atividades-legislativa/${a.slug || a.id}`}
                className="block bg-white rounded-lg border hover:border-navy/30 transition-colors p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ScrollText className="w-6 h-6 text-navy" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {typeLabels[a.type] || a.type} Nº {a.number}/{a.year}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {a.author && <span className="text-xs text-gray-400">Autor: {a.author}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        a.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                        a.status === 'rejeitado' ? 'bg-red-100 text-red-600' :
                        a.status === 'arquivado' ? 'bg-gray-200 text-gray-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{a.summary}</p>
                  </div>
                </div>
              </Link>
            ))}
            {(!activities.data || activities.data.length === 0) && (
              <div className="bg-white rounded-lg border p-12 text-center">
                <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma atividade encontrada.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
