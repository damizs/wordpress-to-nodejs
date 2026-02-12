import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { FileText, Download } from 'lucide-react'

interface Props { sessions: any; filters: { year: string; type: string } }

export default function AtasIndex({ sessions, filters }: Props) {
  return (
    <PublicLayout>
      <Head title="Atas das Sessões - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Atas das Sessões</h1>
            <p className="text-gray-500 mt-2">Consulte as atas das sessões plenárias da Câmara Municipal</p>
          </div>
          <div className="flex gap-3 mb-6 flex-wrap">
            <select value={filters.year} onChange={(e) => router.get('/atas', { ...filters, ano: e.target.value }, { preserveState: true })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Todos os anos</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select value={filters.type} onChange={(e) => router.get('/atas', { ...filters, tipo: e.target.value }, { preserveState: true })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Todos os tipos</option>
              <option value="ordinaria">Ordinária</option>
              <option value="extraordinaria">Extraordinária</option>
              <option value="solene">Solene</option>
            </select>
          </div>
          <div className="space-y-3">
            {sessions.data?.map((s: any) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                <Link href={`/atas/${s.slug || s.id}`} className="flex items-center gap-4 flex-1 hover:opacity-80">
                  <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-navy" /></div>
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">{s.title}</h3>
                    <span className="text-xs text-gray-400">{s.session_date} • {s.type}</span>
                  </div>
                </Link>
                {s.file_url && (
                  <a href={s.file_url} target="_blank" rel="noopener"
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-navy border border-navy/20 rounded-lg hover:bg-navy/5">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </a>
                )}
              </div>
            ))}
            {(!sessions.data || sessions.data.length === 0) && <p className="text-center text-gray-400 py-12">Nenhuma ata encontrada.</p>}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
