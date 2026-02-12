import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload } from 'lucide-react'
import { useRef } from 'react'

interface Props {
  publication: any | null
  types: any[]
}

export default function PublicationForm({ publication, types = [] }: Props) {
  const isEditing = !!publication
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, setData, post, processing } = useForm({
    title: publication?.title || '',
    type: publication?.type || (types[0]?.slug || ''),
    number: publication?.number || '',
    publication_date: publication?.publication_date || '',
    description: publication?.description || '',
    file: null as File | null,
  })

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo *</label>
              <select value={data.type} onChange={(e) => setData('type', e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                {types.map((t: any) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Número</label>
              <input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data *</label>
              <input type="date" value={data.publication_date} onChange={(e) => setData('publication_date', e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Arquivo PDF</label>
            {publication?.file_url && <p className="text-xs text-gray-400 mb-1">Atual: <a href={publication.file_url} target="_blank" className="text-navy underline">Ver PDF</a></p>}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" /> {data.file ? data.file.name : 'Selecionar PDF'}
            </button>
            <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => setData('file', e.target.files?.[0] || null)} className="hidden" />
          </div>
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
