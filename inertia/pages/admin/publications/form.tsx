import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload } from 'lucide-react'
import { useRef } from 'react'

interface Props {
  publication: any | null
}

const typeOptions = ['Portarias', 'Decretos', 'Resoluções', 'Leis', 'Atos', 'Contratos', 'Editais', 'Outros']

export default function PublicationForm({ publication }: Props) {
  const isEditing = !!publication
  const { data, setData, post, processing } = useForm({
    title: publication?.title || '',
    type: publication?.type || 'Portarias',
    number: publication?.number || '',
    publication_date: publication?.publication_date || '',
    description: publication?.description || '',
    file: null as File | null,
  })

  const fileRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/publicacoes/${publication.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/publicacoes', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Publicação' : 'Nova Publicação'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Publicação - Painel`} />

      <Link href="/painel/publicacoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados da Publicação</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)}
              required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo *</label>
              <select value={data.type} onChange={(e) => setData('type', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Número</label>
              <input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)}
                placeholder="Ex: 09/2025"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data de Publicação *</label>
              <input type="date" value={data.publication_date} onChange={(e) => setData('publication_date', e.target.value)}
                required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descrição / Ementa</label>
            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Arquivo PDF</h2>
          {publication?.file_url && (
            <p className="text-sm text-gray-500 mb-2">Arquivo atual: <a href={publication.file_url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{publication.file_url.split('/').pop()}</a></p>
          )}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" /> Selecionar PDF
            </button>
            <span className="text-sm text-gray-400">{data.file?.name || 'Nenhum arquivo selecionado'}</span>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => setData('file', e.target.files?.[0] || null)} className="hidden" />
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
