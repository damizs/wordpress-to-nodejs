import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { Gavel, Download } from 'lucide-react'

interface Props { licitacoes: any; filters: { status: string; modality: string } }

const modalityLabels: Record<string, string> = {
  pregao: 'Pregão', tomada_precos: 'Tomada de Preços', concorrencia: 'Concorrência',
  convite: 'Convite', dispensa: 'Dispensa', inexigibilidade: 'Inexigibilidade',
}
const statusBadge: Record<string, string> = {
  aberta: 'bg-green-100 text-green-700', em_andamento: 'bg-blue-100 text-blue-700',
  encerrada: 'bg-gray-200 text-gray-600', deserta: 'bg-amber-100 text-amber-700',
  revogada: 'bg-red-100 text-red-600', suspensa: 'bg-yellow-100 text-yellow-700',
}

export default function LicitacoesIndex({ licitacoes, filters }: Props) {
  return (
    <PublicLayout>
      <Head title="Licitações - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <Gavel className="w-12 h-12 mx-auto text-navy mb-3" />
            <h1 className="text-3xl font-bold text-gray-900">Licitações</h1>
            <p className="text-gray-500 mt-2">Processos licitatórios da Câmara Municipal de Sumé</p>
          </div>
          <div className="flex gap-3 mb-6 flex-wrap">
            <select value={filters.status} onChange={(e) => router.get('/licitacoes', { ...filters, status: e.target.value }, { preserveState: true })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Todos os status</option>
              <option value="aberta">Aberta</option>
              <option value="em_andamento">Em andamento</option>
              <option value="encerrada">Encerrada</option>
              <option value="deserta">Deserta</option>
              <option value="revogada">Revogada</option>
              <option value="suspensa">Suspensa</option>
            </select>
            <select value={filters.modality} onChange={(e) => router.get('/licitacoes', { ...filters, modalidade: e.target.value }, { preserveState: true })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Todas as modalidades</option>
              {Object.entries(modalityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            {licitacoes.data?.map((l: any) => (
              <Link key={l.id} href={`/licitacoes/${l.slug}`}
                className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gavel className="w-5 h-5 text-navy" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{l.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {l.number && <span className="text-xs text-gray-400">Nº {l.number}</span>}
                      {l.modality && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{modalityLabels[l.modality] || l.modality}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[l.status] || 'bg-gray-100 text-gray-600'}`}>
                        {l.status?.replace('_', ' ')}
                      </span>
                      {l.opening_date && <span className="text-xs text-gray-400">Abertura: {l.opening_date}</span>}
                    </div>
                    {l.object && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{l.object}</p>}
                  </div>
                </div>
              </Link>
            ))}
            {(!licitacoes.data || licitacoes.data.length === 0) && <p className="text-center text-gray-400 py-12">Nenhuma licitação encontrada.</p>}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
