import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'

interface Props {
  item: any | null
}

const categories = [
  { value: 'LAI', label: 'LAI - Lei de Acesso à Informação' },
  { value: 'transparencia', label: 'Transparência' },
  { value: 'sessões', label: 'Sessões Plenárias' },
  { value: 'participação', label: 'Participação Popular' },
  { value: 'sobre a camara', label: 'Sobre a Câmara' },
]

export default function FaqForm({ item }: Props) {
  const isEditing = !!item
  const { data, setData, post, put, processing } = useForm({
    question: item?.question || '',
    answer: item?.answer || '',
    category: item?.category || 'LAI',
    display_order: item?.display_order || 0,
    is_active: item?.is_active ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/faq/${item.id}?_method=PUT`)
    } else {
      post('/painel/faq')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Pergunta' : 'Nova Pergunta'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Pergunta - Painel`} />

      <Link href="/painel/faq" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados da Pergunta</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Categoria *</label>
              <select value={data.category} onChange={(e) => setData('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ordem de exibição</label>
              <input type="number" value={data.display_order} onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Pergunta *</label>
            <input type="text" value={data.question} onChange={(e) => setData('question', e.target.value)}
              required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Resposta *</label>
            <textarea value={data.answer} onChange={(e) => setData('answer', e.target.value)}
              required rows={6} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.is_active}
              onChange={(e) => setData('is_active', e.target.checked)}
              className="rounded border-gray-300 text-navy focus:ring-navy" />
            <span className="text-sm text-gray-600">Ativo (visível no site)</span>
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
