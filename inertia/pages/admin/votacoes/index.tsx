import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, Vote, Sparkles, Eye, EyeOff } from 'lucide-react'

interface Voting {
  id: number
  title: string
  voting_date: string
  year: number
  result: string
  is_unanimous: boolean
  is_published: boolean
  source: string
  session_title: string | null
  votes_count: number
}

interface Props {
  votings: { data: Voting[]; meta: { total: number; currentPage: number; lastPage: number } }
  years: number[]
  filters: { year: string }
}

const resultLabels: Record<string, { label: string; cls: string }> = {
  aprovado: { label: 'Aprovado', cls: 'bg-green-100 text-green-700' },
  rejeitado: { label: 'Rejeitado', cls: 'bg-red-100 text-red-700' },
  retirado: { label: 'Retirado', cls: 'bg-gray-100 text-gray-600' },
  adiado: { label: 'Adiado', cls: 'bg-yellow-100 text-yellow-700' },
  outro: { label: 'Outro', cls: 'bg-gray-100 text-gray-600' },
}

const sourceLabels: Record<string, string> = {
  manual: 'Manual',
  ata_ia: 'Ata (IA)',
  api: 'Sistema de votação',
}

export default function VotingsIndex({ votings, years = [], filters }: Props) {
  function handleDelete(id: number, title: string) {
    if (confirm(`Excluir a votação "${title}"?`)) {
      router.delete(`/painel/votacoes/${id}`)
    }
  }

  return (
    <AdminLayout title="Votações Nominais">
      <Head title="Votações Nominais - Painel" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{votings.meta?.total ?? votings.data.length} votação(ões)</p>
          <select value={filters.year}
            onChange={(e) => router.get('/painel/votacoes', { year: e.target.value }, { preserveState: true })}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1">
            <option value="">Todos os anos</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/painel/votacoes/importar"
            className="flex items-center gap-2 px-4 py-2.5 border border-navy/20 text-navy rounded-xl hover:bg-navy/5 transition-colors text-sm font-medium">
            <Sparkles className="w-4 h-4" /> Importar da Ata (IA)
          </Link>
          <Link href="/painel/votacoes/criar"
            className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova Votação
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {votings.data.length === 0 ? (
          <div className="p-12 text-center">
            <Vote className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">Nenhuma votação cadastrada</p>
            <p className="text-sm text-gray-400">Cadastre manualmente ou importe das atas com IA</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Matéria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Resultado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Votos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Origem</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Publicada</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {votings.data.map((v) => {
                const result = resultLabels[v.result] || resultLabels.outro
                return (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(v.voting_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      <p className="line-clamp-2">{v.title}</p>
                      {v.session_title && <p className="text-xs text-gray-400 mt-0.5">{v.session_title}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${result.cls}`}>{result.label}</span>
                      {v.is_unanimous && <span className="inline-block ml-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Unânime</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{v.votes_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sourceLabels[v.source] || v.source}</td>
                    <td className="px-4 py-3">
                      {v.is_published
                        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700"><Eye className="w-3.5 h-3.5" /> Sim</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400"><EyeOff className="w-3.5 h-3.5" /> Não</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/painel/votacoes/${v.id}/editar`} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(v.id, v.title)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {votings.meta && votings.meta.lastPage > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {votings.meta.currentPage > 1 && (
            <button onClick={() => router.get('/painel/votacoes', { page: votings.meta.currentPage - 1, year: filters.year })}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Anterior</button>
          )}
          <span className="px-4 py-2 text-sm text-gray-500">Página {votings.meta.currentPage} de {votings.meta.lastPage}</span>
          {votings.meta.currentPage < votings.meta.lastPage && (
            <button onClick={() => router.get('/painel/votacoes', { page: votings.meta.currentPage + 1, year: filters.year })}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Próxima</button>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
