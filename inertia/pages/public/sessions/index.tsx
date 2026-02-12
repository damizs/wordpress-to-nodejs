import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { FileText, Download, Video } from 'lucide-react'

interface Props { sessions: any; filters: { year: string; type: string } }

const typeBadge: Record<string, string> = {
  ordinaria: 'bg-blue-100 text-blue-700',
  extraordinaria: 'bg-amber-100 text-amber-700',
  solene: 'bg-purple-100 text-purple-700',
  especial: 'bg-green-100 text-green-700',
}

export default function SessionsIndex({ sessions, filters }: Props) {
  function applyFilter(key: string, value: string) {
    router.get('/sessoes', { ...filters, [key]: value }, { preserveState: true })
  }

  return (
    <PublicLayout>
      <Head title="Sessões Plenárias - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Sessões Plenárias e Atas</h1>
            <p className="text-gray-500 mt-2">Acompanhe as sessões realizadas pela Câmara Municipal</p>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            <select value={filters.year} onChange={(e) => applyFilter('ano', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Todos os anos</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select value={filters.type} onChange={(e) => applyFilter('tipo', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">Todos os tipos</option>
              <option value="ordinaria">Ordinária</option>
              <option value="extraordinaria">Extraordinária</option>
              <option value="solene">Solene</option>
              <option value="especial">Especial</option>
            </select>
          </div>

          <div className="space-y-3">
            {sessions.data?.map((s: any) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">{s.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{s.session_date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeBadge[s.type] || 'bg-gray-100 text-gray-600'}`}>{s.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.video_url && (
                    <a href={s.video_url} target="_blank" rel="noopener" className="p-2 text-gray-400 hover:text-navy" title="Assistir vídeo">
                      <Video className="w-4 h-4" />
                    </a>
                  )}
                  {s.file_url && (
                    <a href={s.file_url} target="_blank" rel="noopener" className="p-2 text-gray-400 hover:text-navy" title="Baixar ata">
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            {(!sessions.data || sessions.data.length === 0) && (
              <p className="text-center text-gray-400 py-12">Nenhuma sessão encontrada.</p>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
