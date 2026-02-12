import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ClipboardList } from 'lucide-react'

interface Props { sessions: any; filters: { year: string } }

export default function PautasIndex({ sessions, filters }: Props) {
  return (
    <PublicLayout>
      <Head title="Pautas das Sessões - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Pautas das Sessões</h1>
            <p className="text-gray-500 mt-2">Ordem do dia das sessões plenárias</p>
          </div>
          <div className="flex gap-3 mb-6">
            <select value={filters.year} onChange={(e) => router.get('/pautas', { ano: e.target.value }, { preserveState: true })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Todos os anos</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {sessions.data?.map((s: any) => (
              <Link key={s.id} href={`/pautas/${s.slug || s.id}`}
                className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center"><ClipboardList className="w-5 h-5 text-amber-600" /></div>
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">{s.title}</h3>
                    <span className="text-xs text-gray-400">{s.session_date} • {s.type}</span>
                  </div>
                </div>
              </Link>
            ))}
            {(!sessions.data || sessions.data.length === 0) && <p className="text-center text-gray-400 py-12">Nenhuma pauta encontrada.</p>}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
