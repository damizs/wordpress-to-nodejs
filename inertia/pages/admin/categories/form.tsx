import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'

const typeOptions = [
  { value: 'faq', label: 'FAQ' },
  { value: 'information_record', label: 'Acesso à Informação' },
  { value: 'publication', label: 'Publicações' },
  { value: 'session_type', label: 'Tipo de Sessão' },
]

interface Props {
  category: any | null
}

export default function CategoryForm({ category }: Props) {
  const isEditing = !!category

  const { data, setData, post, processing } = useForm({
    type: category?.type || 'faq',
    name: category?.name || '',
    slug: category?.slug || '',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
  })

  function generateSlug(name: string) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/categorias/${category.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/categorias', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Categoria - Painel`} />

      <Link href="/painel/categorias" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tipo *</label>
            <select value={data.type} onChange={(e) => setData('type', e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
              {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
              <input type="text" value={data.name} onChange={(e) => {
                setData('name', e.target.value)
                if (!isEditing) setData('slug', generateSlug(e.target.value))
              }} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Slug</label>
              <input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ordem</label>
              <input type="number" value={data.display_order} onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-navy focus:ring-navy" />
                <span className="text-sm text-gray-600">Ativa</span>
              </label>
            </div>
          </div>
        </div>

        <button type="submit" disabled={processing}
          className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </AdminLayout>
  )
}
