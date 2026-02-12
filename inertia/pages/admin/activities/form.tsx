import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'

interface Props {
  activity: any | null
}

const TYPES = ['Projeto de Lei', 'Requerimento', 'Projeto de Resolução', 'Indicação', 'Veto', 'Portaria', 'Moção', 'Emenda']
const STATUSES = ['Em tramitação', 'Aprovado', 'Rejeitado', 'Arquivado', 'Sancionado', 'Vetado']

export default function ActivityForm({ activity }: Props) {
  const isEditing = !!activity
  const { data, setData, post, put, processing } = useForm({
    type: activity?.type || 'Projeto de Lei',
    number: activity?.number || '',
    year: activity?.year || new Date().getFullYear(),
    summary: activity?.summary || '',
    content: activity?.content || '',
    status: activity?.status || 'Em tramitação',
    author: activity?.author || '',
    file_url: activity?.file_url || '',
    session_date: activity?.session_date || '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      put(`/painel/atividades/${activity.id}`)
    } else {
      post('/painel/atividades')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Atividade' : 'Nova Atividade'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Atividade - Painel`} />

      <Link href="/painel/atividades" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados da Atividade</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo *</label>
              <select value={data.type} onChange={(e) => setData('type', e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Número *</label>
              <input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)} required
                placeholder="001" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ano *</label>
              <input type="number" value={data.year} onChange={(e) => setData('year', parseInt(e.target.value))} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Ementa *</label>
            <textarea value={data.summary} onChange={(e) => setData('summary', e.target.value)} rows={3} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Conteúdo / Inteiro Teor</label>
            <textarea value={data.content} onChange={(e) => setData('content', e.target.value)} rows={6}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Situação</label>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Autor</label>
              <input type="text" value={data.author} onChange={(e) => setData('author', e.target.value)}
                placeholder="Nome do vereador" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data da Sessão</label>
              <input type="date" value={data.session_date} onChange={(e) => setData('session_date', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">URL do Arquivo (PDF)</label>
            <input type="text" value={data.file_url} onChange={(e) => setData('file_url', e.target.value)}
              placeholder="https://..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={processing}
            className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50 font-medium">
            <Save className="w-4 h-4" />
            {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
