import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'

interface Props {
  section: any
  link: any | null
}

export default function LinkForm({ section, link }: Props) {
  const isEditing = !!link
  const { data, setData, post, put, processing } = useForm({
    title: link?.title || '',
    url: link?.url || '',
    icon: link?.icon || '',
    display_order: link?.display_order || 0,
    is_external: link?.is_external ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      put(`/painel/transparencia/links/${link.id}`)
    } else {
      post(`/painel/transparencia/secoes/${section.id}/links`)
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Link' : `Novo Link → ${section.title}`}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Link - Painel`} />

      <Link href="/painel/transparencia" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <p className="text-sm text-gray-500 mb-2">Seção: <strong>{section.title}</strong></p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
              <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">URL *</label>
              <input type="text" value={data.url} onChange={(e) => setData('url', e.target.value)} required
                placeholder="https://..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ícone</label>
              <input type="text" value={data.icon} onChange={(e) => setData('icon', e.target.value)}
                placeholder="Ex: FileText" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ordem</label>
              <input type="number" value={data.display_order} onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_external" checked={data.is_external === true || data.is_external === 'true'}
              onChange={(e) => setData('is_external', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy" />
            <label htmlFor="is_external" className="text-sm text-gray-600">Link externo (abre em nova aba)</label>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={processing}
            className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50 font-medium">
            <Save className="w-4 h-4" /> {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
