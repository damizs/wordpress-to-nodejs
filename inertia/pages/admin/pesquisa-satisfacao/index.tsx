import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Star, Eye, Trash2 } from 'lucide-react'

interface Props { surveys: any; stats: any; filters: { isRead: string } }

function StatCard({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}<span className="text-sm text-gray-400 font-normal">{suffix}</span></p>
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${rating >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

export default function PesquisaSatisfacaoAdmin({ surveys, stats, filters }: Props) {
  return (
    <AdminLayout title="Pesquisa de Satisfação">
      <Head title="Pesquisa de Satisfação - Painel" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatCard label="Total de respostas" value={stats.total} />
        <StatCard label="Não lidas" value={stats.unread} />
        <StatCard label="Média Geral" value={stats.avg_geral} suffix="/5" />
        <StatCard label="Atendimento" value={stats.avg_atendimento} suffix="/5" />
        <StatCard label="Transparência" value={stats.avg_transparencia} suffix="/5" />
        <StatCard label="Legislativo" value={stats.avg_legislativo} suffix="/5" />
        <StatCard label="Infraestrutura" value={stats.avg_infraestrutura} suffix="/5" />
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <select value={filters.isRead} onChange={(e) => router.get('/painel/pesquisa-satisfacao', { lido: e.target.value }, { preserveState: true })}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Todas</option>
          <option value="false">Não lidas</option>
          <option value="true">Lidas</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Nome</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Geral</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Data</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {surveys.data?.map((s: any) => (
              <tr key={s.id} className={`hover:bg-gray-50/50 ${!s.is_read ? 'bg-blue-50/30' : ''}`}>
                <td className="px-6 py-3">
                  <div className="text-sm font-medium text-gray-800">{s.name || <span className="text-gray-400 italic">Anônimo</span>}</div>
                  {s.email && <div className="text-xs text-gray-400">{s.email}</div>}
                </td>
                <td className="px-6 py-3"><Stars rating={s.rating_geral} /></td>
                <td className="px-6 py-3 text-sm text-gray-500">{new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-3">
                  {!s.is_read ? (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Nova</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Lida</span>
                  )}
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/painel/pesquisa-satisfacao/${s.id}`} className="p-1.5 text-gray-400 hover:text-navy"><Eye className="w-4 h-4" /></Link>
                    <button onClick={() => { if (confirm('Excluir?')) router.delete(`/painel/pesquisa-satisfacao/${s.id}`) }}
                      className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {(!surveys.data || surveys.data.length === 0) && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Nenhuma resposta recebida ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
