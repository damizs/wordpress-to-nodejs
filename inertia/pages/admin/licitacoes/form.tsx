import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload } from 'lucide-react'
import { useRef } from 'react'

interface Props { licitacao: any | null }

export default function LicitacaoForm({ licitacao }: Props) {
  const isEditing = !!licitacao
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, setData, post, processing } = useForm({
    title: licitacao?.title || '',
    number: licitacao?.number || '',
    modality: licitacao?.modality || 'pregao',
    status: licitacao?.status || 'aberta',
    object: licitacao?.object || '',
    content: licitacao?.content || '',
    estimated_value: licitacao?.estimated_value || '',
    opening_date: licitacao?.opening_date || '',
    closing_date: licitacao?.closing_date || '',
    year: licitacao?.year || new Date().getFullYear(),
    is_active: licitacao?.is_active ?? true,
    file: null as File | null,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/licitacoes/${licitacao.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/licitacoes', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Licitação' : 'Nova Licitação'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Licitação - Painel`} />
      <Link href="/painel/licitacoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Número</label>
              <input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Modalidade</label>
              <select value={data.modality} onChange={(e) => setData('modality', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="pregao">Pregão</option>
                <option value="tomada_precos">Tomada de Preços</option>
                <option value="concorrencia">Concorrência</option>
                <option value="convite">Convite</option>
                <option value="dispensa">Dispensa</option>
                <option value="inexigibilidade">Inexigibilidade</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="aberta">Aberta</option>
                <option value="em_andamento">Em andamento</option>
                <option value="encerrada">Encerrada</option>
                <option value="deserta">Deserta</option>
                <option value="revogada">Revogada</option>
                <option value="suspensa">Suspensa</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Objeto da Licitação</label>
            <textarea value={data.object} onChange={(e) => setData('object', e.target.value)}
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Valor Estimado (R$)</label>
              <input type="number" step="0.01" value={data.estimated_value} onChange={(e) => setData('estimated_value', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data Abertura</label>
              <input type="date" value={data.opening_date} onChange={(e) => setData('opening_date', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data Encerramento</label>
              <input type="date" value={data.closing_date} onChange={(e) => setData('closing_date', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Conteúdo / Detalhes</label>
            <textarea value={data.content} onChange={(e) => setData('content', e.target.value)}
              rows={4} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Edital (PDF)</label>
            {licitacao?.file_url && <p className="text-xs text-gray-400 mb-1">Atual: <a href={licitacao.file_url} target="_blank" className="text-navy underline">Ver PDF</a></p>}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" /> {data.file ? data.file.name : 'Selecionar PDF'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => setData('file', e.target.files?.[0] || null)} className="hidden" />
          </div>
        </div>
        <button type="submit" disabled={processing}
          className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {processing ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </AdminLayout>
  )
}
