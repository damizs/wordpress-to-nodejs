import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { Gavel, Download, Filter, Calendar } from 'lucide-react'

interface Props { licitacoes: any; filters: { status: string; modality: string } }

const statusLabels: Record<string, string> = { aberta: 'Aberta', encerrada: 'Encerrada', em_andamento: 'Em andamento', suspensa: 'Suspensa', cancelada: 'Cancelada', deserta: 'Deserta' }
const modalityLabels: Record<string, string> = { pregao: 'Pregão', tomada_precos: 'Tomada de Preços', concorrencia: 'Concorrência', convite: 'Convite', dispensa: 'Dispensa', inexigibilidade: 'Inexigibilidade' }

export default function LicitacoesIndex({ licitacoes, filters }: Props) {
  return (
    <PublicLayout>
      <Head title="Licitações - Câmara de Sumé" />
      <PageHero title="Licitações e Contratos" subtitle="Processos licitatórios e contratos da Câmara Municipal" icon={<Gavel className="w-8 h-8" />}
        breadcrumbs={[{ label: 'Licitações' }]} />
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-4 mb-6 flex gap-3 flex-wrap items-center">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filters.status} onChange={(e) => router.get('/licitacoes', { ...filters, status: e.target.value }, { preserveState: true })}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none">
              <option value="">Todos os status</option>
              {Object.entries(statusLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
            </select>
            <select value={filters.modality} onChange={(e) => router.get('/licitacoes', { ...filters, modalidade: e.target.value }, { preserveState: true })}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none">
              <option value="">Todas as modalidades</option>
              {Object.entries(modalityLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
            </select>
          </div>
          <div className="space-y-3">
            {licitacoes.data?.map((l: any) => (
              <div key={l.id} className="bg-white rounded-lg border hover:border-navy/30 transition-colors p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0"><Gavel className="w-6 h-6 text-amber-600" /></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{l.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">{modalityLabels[l.modality] || l.modality}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{l.opening_date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        l.status === 'aberta' ? 'bg-green-100 text-green-700' :
                        l.status === 'encerrada' ? 'bg-gray-200 text-gray-600' :
                        l.status === 'cancelada' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>{statusLabels[l.status] || l.status}</span>
                    </div>
                    {l.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{l.description}</p>}
                  </div>
                  {l.file_url && (
                    <a href={l.file_url} target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex-shrink-0">
                      <Download className="w-4 h-4" /> PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
            {(!licitacoes.data || licitacoes.data.length === 0) && (
              <div className="bg-white rounded-lg border p-12 text-center"><Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhuma licitação encontrada.</p></div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
