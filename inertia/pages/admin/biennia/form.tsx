import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'

interface Props {
  biennium: any | null
  legislatures: any[]
}

export default function BienniumForm({ biennium, legislatures }: Props) {
  const isEditing = !!biennium

  const { data, setData, post, processing } = useForm({
    name: biennium?.name || '',
    legislature_id: biennium?.legislature_id || '',
    start_date: biennium?.start_date || '',
    end_date: biennium?.end_date || '',
    is_current: biennium?.is_current ?? false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/bienios/${biennium.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/bienios', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Biênio' : 'Novo Biênio'}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Biênio - Painel`} />

      <Link href="/painel/bienios" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required
              placeholder="Ex: BIÊNIO - 2025/2026"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Legislatura *</label>
            <select value={data.legislature_id} onChange={(e) => setData('legislature_id', e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
              <option value="">Selecionar...</option>
              {legislatures.map((l: any) => (
                <option key={l.id} value={l.id}>{l.name} ({l.number}ª){l.is_current ? ' ✓' : ''}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data Início *</label>
              <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data Fim *</label>
              <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.is_current} onChange={(e) => setData('is_current', e.target.checked)}
              className="rounded border-gray-300 text-navy focus:ring-navy" />
            <span className="text-sm text-gray-600">Biênio atual</span>
          </label>
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
