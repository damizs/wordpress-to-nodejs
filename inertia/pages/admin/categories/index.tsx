import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const typeLabels: Record<string, string> = {
  faq: 'FAQ',
  information_record: 'Acesso à Informação',
  publication: 'Publicações',
  session_type: 'Tipo de Sessão',
}

interface Props {
  categories: any[]
  filters: { type: string }
}

export default function CategoriesIndex({ categories, filters }: Props) {
  const grouped = categories.reduce((acc: Record<string, any[]>, cat: any) => {
    if (!acc[cat.type]) acc[cat.type] = []
    acc[cat.type].push(cat)
    return acc
  }, {})

  return (
    <AdminLayout title="Categorias do Sistema">
      <Head title="Categorias - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Gerencie as categorias usadas nos formulários do sistema</p>
        <Link href="/painel/categorias/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Categoria
        </Link>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Link href="/painel/categorias"
          className={`px-3 py-1.5 rounded-lg text-sm ${!filters.type ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Todas
        </Link>
        {Object.entries(typeLabels).map(([key, label]) => (
          <Link key={key} href={`/painel/categorias?type=${key}`}
            className={`px-3 py-1.5 rounded-lg text-sm ${filters.type === key ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </Link>
        ))}
      </div>

      {Object.entries(filters.type ? { [filters.type]: grouped[filters.type] || [] } : grouped).map(([type, cats]) => (
        <div key={type} className="bg-white rounded-xl border border-gray-100 mb-4">
          <div className="px-6 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-700">{typeLabels[type] || type}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(cats as any[]).map((cat: any) => (
              <div key={cat.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6">{cat.display_order}</span>
                  <span className="text-sm text-gray-800">{cat.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{cat.slug}</span>
                  {!cat.is_active && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inativo</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/painel/categorias/${cat.id}/editar`} className="p-1.5 text-gray-400 hover:text-navy">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button onClick={() => { if (confirm('Excluir esta categoria?')) router.delete(`/painel/categorias/${cat.id}`) }}
                    className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {(cats as any[]).length === 0 && (
              <p className="px-6 py-4 text-sm text-gray-400">Nenhuma categoria neste tipo.</p>
            )}
          </div>
        </div>
      ))}
    </AdminLayout>
  )
}
