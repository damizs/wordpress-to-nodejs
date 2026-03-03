import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

interface Seal {
  id: number
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  sort_order: number
  is_active: boolean
}

interface Props {
  seal: Seal | null
}

export default function SealForm({ seal }: Props) {
  const isEditing = !!seal
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(seal?.image_url || null)

  const { data, setData, post, processing } = useForm({
    title: seal?.title || '',
    description: seal?.description || '',
    link_url: seal?.link_url || '',
    sort_order: seal?.sort_order || 0,
    is_active: seal?.is_active === false ? 'false' : 'true',
    image: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData('image', file)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const url = isEditing ? '/painel/selos/' + seal.id : '/painel/selos'
    post(url, { forceFormData: true })
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Selo' : 'Novo Selo'}>
      <Head title={(isEditing ? 'Editar' : 'Novo') + ' Selo - Painel'} />

      <div className="flex items-center gap-4 mb-6">
        <Link href="/painel/selos" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Selo' : 'Novo Selo'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl border p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titulo *</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-navy/20 focus:border-navy"
              placeholder="Ex: Qualidade em Transparencia"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descricao</label>
            <textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-navy/20 focus:border-navy"
              placeholder="Ex: Selo concedido pela Atricon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Selo</label>
            <div className="flex items-start gap-4">
              {preview ? (
                <img src={preview} alt="Preview" className="w-32 h-32 object-contain rounded-lg border bg-gray-50" />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Selecionar Imagem
                </button>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG ou SVG (max 2MB)</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link (opcional)</label>
            <input
              type="url"
              value={data.link_url}
              onChange={(e) => setData('link_url', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-navy/20 focus:border-navy"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordem</label>
              <input
                type="number"
                value={data.sort_order}
                onChange={(e) => setData('sort_order', Number(e.target.value))}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={data.is_active}
                onChange={(e) => setData('is_active', e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-navy/20 focus:border-navy"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Link href="/painel/selos" className="px-6 py-2.5 border rounded-lg hover:bg-gray-50">Cancelar</Link>
          <button
            type="submit"
            disabled={processing}
            className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-lg hover:bg-navy-dark disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {processing ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
