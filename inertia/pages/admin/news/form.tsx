import { Head, useForm, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, Image, X } from 'lucide-react'
import { useState, useRef } from 'react'

interface NewsItem {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  status: string
  cover_image_url: string | null
  category_id: number | null
}

interface Props {
  news: NewsItem | null
  categories: Array<{ id: number; name: string; slug: string }>
}

export default function NewsForm({ news: existing, categories }: Props) {
  const isEditing = !!existing

  const { data, setData, processing } = useForm({
    title: existing?.title || '',
    excerpt: existing?.excerpt || '',
    content: existing?.content || '',
    status: existing?.status || 'draft',
    category_id: existing?.category_id?.toString() || '',
    cover_image: null as File | null,
  })

  const [coverPreview, setCoverPreview] = useState<string | null>(existing?.cover_image_url || null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleCoverChange(file: File | null) {
    setData('cover_image', file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setCoverPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('excerpt', data.excerpt)
    formData.append('content', data.content)
    formData.append('status', data.status)
    formData.append('category_id', data.category_id)
    if (data.cover_image) {
      formData.append('cover_image', data.cover_image)
    }

    if (isEditing) {
      formData.append('_method', 'PUT')
      router.post(`/painel/noticias/${existing!.id}`, formData, {
        forceFormData: true,
      })
    } else {
      router.post('/painel/noticias', formData, {
        forceFormData: true,
      })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Notícia' : 'Nova Notícia'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Notícia - Painel`} />

      <div className="max-w-4xl">
        {/* Back */}
        <Link
          href="/painel/noticias"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para listagem
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main content */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all"
                placeholder="Título da notícia"
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Resumo</label>
              <textarea
                value={data.excerpt}
                onChange={(e) => setData('excerpt', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all resize-none"
                placeholder="Resumo curto da notícia (aparece na listagem)"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Conteúdo</label>
              <textarea
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all font-mono"
                placeholder="Conteúdo da notícia (HTML suportado)"
              />
              <p className="text-xs text-gray-400 mt-1">Suporta HTML. Em breve: editor visual.</p>
            </div>
          </div>

          {/* Sidebar options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Cover Image */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">Imagem de Capa</label>
              {coverPreview ? (
                <div className="relative rounded-lg overflow-hidden mb-3">
                  <img src={coverPreview} alt="Preview" className="w-full h-40 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPreview(null)
                      setData('cover_image', null)
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-navy/30 transition-colors mb-3"
                >
                  <Image className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400">Clique para enviar</span>
                  <span className="text-xs text-gray-300 mt-1">JPG, PNG ou WebP até 5MB</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleCoverChange(e.target.files?.[0] || null)}
              />
              {!coverPreview && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Selecionar imagem
                </button>
              )}
            </div>

            {/* Status + Category */}
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={data.status}
                  onChange={(e) => setData('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 outline-none"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicada</option>
                  <option value="archived">Arquivada</option>
                </select>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
                <select
                  value={data.category_id}
                  onChange={(e) => setData('category_id', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 outline-none"
                >
                  <option value="">Sem categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/painel/noticias"
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Notícia'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
