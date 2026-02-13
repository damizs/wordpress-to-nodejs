import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { ClipboardList, Filter, Calendar } from 'lucide-react'

interface Props { sessions: any; filters: { year: string } }

export default function PautasIndex({ sessions, filters }: Props) {
  return (
    <PublicLayout>
      <Head title="Pautas das Sessões - Câmara de Sumé" />
      <PageHero title="Pautas das Sessões" subtitle="Confira as pautas das sessões plenárias" icon={<ClipboardList className="w-8 h-8" />}
        breadcrumbs={[{ label: 'Pautas das Sessões' }]} />
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-4 mb-6 flex gap-3 items-center">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filters.year} onChange={(e) => router.get('/pautas', { ano: e.target.value }, { preserveState: true })}
              className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none">
              <option value="">Todos os anos</option>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>{y}</option>))}
            </select>
          </div>
          <div className="space-y-3">
            {sessions.data?.map((s: any) => (
              <Link key={s.id} href={`/pautas/${s.slug || s.id}`}
                className="block bg-white rounded-lg border hover:border-navy/30 transition-colors p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0"><ClipboardList className="w-6 h-6 text-amber-600" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{s.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{s.session_date}</span>
                      <span className="text-xs text-gray-400">• {s.type}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {(!sessions.data || sessions.data.length === 0) && (
              <div className="bg-white rounded-lg border p-12 text-center"><ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhuma pauta encontrada.</p></div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
