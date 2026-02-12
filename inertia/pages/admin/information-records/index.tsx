import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, Info, ExternalLink } from 'lucide-react'

interface Record {
  id: number
  title: string
  category: string
  year: number
  file_url: string | null
  is_active: boolean
}

interface Props {
  records: { data: Record[]; meta: any }
  filters: { category: string; year: string }
}

const categoryLabels: Record<string, string> = {
  'verbas': 'Verbas Indenizatórias',
  'estagiarios': 'Estagiários',
  'terceirizados': 'Terceirizados',
  'rgf': 'RGF - Relatório Gestão Fiscal',
  'relatorio-gestao': 'Relatório de Gestão',
  'prestacao-contas': 'Prestação de Contas',
  'transferencias-recebidas': 'Transferências Recebidas',
  'transferencias-realizadas': 'Transferências Realizadas',
  'parecer-contas': 'Parecer das Contas',
  'obras': 'Obras',
  'acordos': 'Acordos e Convênios',
  'apreciacao': 'Apreciação de Contas',
  'plano-estrategico': 'Plano Estratégico',
  'concursos': 'Concursos',
  'pca': 'Plano de Contratações',
  'estrutura-organizacional': 'Estrutura Organizacional',
  'carta-servicos': 'Carta de Serviços',
}

export default function InformationRecordsIndex({ records, filters }: Props) {
  function handleDelete(id: number, title: string) {
    if (confirm(`Excluir "${title}"?`)) {
      router.delete(`/painel/acesso-informacao/${id}`)
    }
  }

  return (
    <AdminLayout title="Acesso à Informação">
      <Head title="Acesso à Informação - Painel" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{records.meta?.total || records.data.length} registro(s)</p>
          <select value={filters.category}
            onChange={(e) => router.get('/painel/acesso-informacao', { category: e.target.value, year: filters.year }, { preserveState: true })}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1">
            <option value="">Todas categorias</option>
            {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <Link href="/painel/acesso-informacao/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo Registro
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {records.data.length === 0 ? (
          <div className="p-12 text-center">
            <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum registro cadastrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ano</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Arquivo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {records.data.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{r.year}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {categoryLabels[r.category] || r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.file_url ? (
                      <a href={r.file_url} target="_blank" rel="noopener" className="text-blue-600 hover:text-blue-800">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/painel/acesso-informacao/${r.id}/editar`} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(r.id, r.title)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
