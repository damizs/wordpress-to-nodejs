import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, Link2, GripVertical } from 'lucide-react'

export default function QuickLinksIndex({ links }: { links: any[] }) {
  function handleDelete(id: number, title: string) {
    if (confirm(`Excluir "${title}"?`)) {
      router.delete(`/painel/links-rapidos/${id}`)
    }
  }

  return (
    <AdminLayout title="Links Rápidos">
      <Head title="Links Rápidos - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{links.length} link(s) — exibidos na homepage como cards de acesso rápido</p>
        <Link href="/painel/links-rapidos/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo Link
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {links.length === 0 ? (
          <div className="p-12 text-center">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum link cadastrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">URL</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ícone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l: any) => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm text-gray-400">{l.display_order}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{l.title}</td>
                  <td className="px-4 py-3 text-sm text-blue-600 truncate max-w-xs">{l.url}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{l.icon || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      l.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{l.is_active ? 'Ativo' : 'Inativo'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/painel/links-rapidos/${l.id}/editar`}
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(l.id, l.title)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
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
