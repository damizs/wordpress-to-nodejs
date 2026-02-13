import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { FileText, Download, Filter } from 'lucide-react'

interface Props { sessions: any; filters: { year: string; type: string } }

export default function AtasIndex({ sessions, filters }: Props) {
  return (
    <PublicLayout>
      <Head title="Atas das Sessões - Câmara de Sumé" />
      <PageHero title="Atas das Sessões" subtitle="Consulte as atas das sessões plenárias da Câmara Municipal" icon={<FileText className="w-8 h-8" />}
        breadcrumbs={[{ label: 'Atas das Sessões' }]} />
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-4 mb-6 flex gap-3 flex-wrap items-center">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filters.year} onChange={(e) => router.get('/atas', { ...filters, ano: e.target.value }, { preserveState: true })}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none">
              <option value="">Todos os anos</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>{y}</option>))}
            </select>
            <select value={filters.type} onChange={(e) => router.get('/atas', { ...filters, tipo: e.target.value }, { preserveState: true })}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none">
              <option value="">Todos os tipos</option>
              <option value="ordinaria">Ordinária</option>
              <option value="extraordinaria">Extraordinária</option>
              <option value="solene">Solene</option>
            </select>
          </div>
          <div className="space-y-3">
            {sessions.data?.map((s: any) => (
              <div key={s.id} className="bg-white rounded-lg border hover:border-navy/30 transition-colors p-4 flex items-center justify-between">
                <Link href={`/atas/${s.slug || s.id}`} className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-red-500" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{s.title}</h3>
                    <span className="text-xs text-gray-400">{s.session_date} • {s.type}</span>
                  </div>
                </Link>
                {s.file_url && (
                  <a href={s.file_url} target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex-shrink-0">
                    <Download className="w-4 h-4" /> PDF
                  </a>
                )}
              </div>
            ))}
            {(!sessions.data || sessions.data.length === 0) && (
              <div className="bg-white rounded-lg border p-12 text-center"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhuma ata encontrada.</p></div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
