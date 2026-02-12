import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'

export default function SectionForm({ section }: { section: any | null }) {
  const isEditing = !!section
  const { data, setData, post, put, processing } = useForm({
    title: section?.title || '',
    slug: section?.slug || '',
    icon: section?.icon || '',
    description: section?.description || '',
    display_order: section?.display_order || 0,
    is_active: section?.is_active ?? true,
  })

  function generateSlug(title: string) {
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      put(`/painel/transparencia/secoes/${section.id}`)
    } else {
      post('/painel/transparencia/secoes')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Seção' : 'Nova Seção'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Seção - Painel`} />

      <Link href="/painel/transparencia" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
              <input type="text" value={data.title} onChange={(e) => {
                setData('title', e.target.value)
                if (!isEditing) setData('slug', generateSlug(e.target.value))
              }} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Slug</label>
              <input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ícone</label>
              <input type="text" value={data.icon} onChange={(e) => setData('icon', e.target.value)}
                placeholder="Ex: Shield, FileText" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ordem</label>
              <input type="number" value={data.display_order} onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none resize-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={data.is_active === true || data.is_active === 'true'}
              onChange={(e) => setData('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy" />
            <label htmlFor="is_active" className="text-sm text-gray-600">Seção ativa</label>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={processing}
            className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50 font-medium">
            <Save className="w-4 h-4" /> {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
