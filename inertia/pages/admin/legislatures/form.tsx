import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'

interface Props {
  legislature: any | null
}

export default function LegislatureForm({ legislature }: Props) {
  const isEditing = !!legislature
  const { data, setData, post, put, processing } = useForm({
    name: legislature?.name || '',
    number: legislature?.number || '',
    start_date: legislature?.start_date || '',
    end_date: legislature?.end_date || '',
    is_current: legislature?.is_current ?? false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/legislaturas/${legislature.id}?_method=PUT`)
    } else {
      post('/painel/legislaturas')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Legislatura' : 'Nova Legislatura'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Legislatura - Painel`} />

      <Link href="/painel/legislaturas" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados da Legislatura</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
              <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                placeholder="Ex: LEGISLATURA 2025/2028" required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Número *</label>
              <input type="number" value={data.number} onChange={(e) => setData('number', e.target.value)}
                placeholder="Ex: 19" required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data Início *</label>
              <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)}
                required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data Fim *</label>
              <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)}
                required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.is_current}
              onChange={(e) => setData('is_current', e.target.checked)}
              className="rounded border-gray-300 text-navy focus:ring-navy" />
            <span className="text-sm text-gray-600">Legislatura atual</span>
          </label>
        </div>

        <button type="submit" disabled={processing}
          className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </AdminLayout>
  )
}
