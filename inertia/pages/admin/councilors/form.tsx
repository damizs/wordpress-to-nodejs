import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload } from 'lucide-react'
import { useState, useRef } from 'react'

interface Props {
  councilor: any | null
  legislatures: any[]
}

export default function CouncilorForm({ councilor, legislatures }: Props) {
  const isEditing = !!councilor
  const { data, setData, post, put, processing } = useForm({
    name: councilor?.name || '',
    slug: councilor?.slug || '',
    party: councilor?.party || '',
    email: councilor?.email || '',
    phone: councilor?.phone || '',
    bio: councilor?.bio || '',
    role: councilor?.role || 'Vereador',
    is_active: councilor?.is_active ?? true,
    legislature_id: councilor?.legislature_id || '',
    display_order: councilor?.display_order || 0,
    photo: null as File | null,
  })

  const photoRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(councilor?.photo_url || null)

  function handlePhotoChange(file: File | null) {
    setData('photo', file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/vereadores/${councilor.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/vereadores', { forceFormData: true })
    }
  }

  function generateSlug(name: string) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Vereador' : 'Novo Vereador'}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Vereador - Painel`} />

      <Link href="/painel/vereadores" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados do Vereador</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome Completo *</label>
              <input type="text" value={data.name} onChange={(e) => {
                setData('name', e.target.value)
                if (!isEditing) setData('slug', generateSlug(e.target.value))
              }} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Slug</label>
              <input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Partido</label>
              <input type="text" value={data.party} onChange={(e) => setData('party', e.target.value)}
                placeholder="Ex: PP, MDB, PSD" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cargo / Função</label>
              <select value={data.role} onChange={(e) => setData('role', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="Presidente">Presidente</option>
                <option value="Vice-Presidente">Vice-Presidente</option>
                <option value="1º Secretário">1º Secretário</option>
                <option value="2º Secretário">2º Secretário</option>
                <option value="Vereador">Vereador</option>
                <option value="Vereadora">Vereadora</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label>
              <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Legislatura</label>
              <select value={data.legislature_id} onChange={(e) => setData('legislature_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="">Selecione...</option>
                {legislatures.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ordem de exibição</label>
              <input type="number" value={data.display_order} onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Biografia</label>
            <textarea value={data.bio} onChange={(e) => setData('bio', e.target.value)} rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none resize-none" />
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Foto</label>
              <div onClick={() => photoRef.current?.click()}
                className="flex items-center gap-3 px-3 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-navy/30 transition-colors w-48">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto" className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <span className="text-xs text-gray-500">Selecionar</span>
              </div>
              <input ref={photoRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)} />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="is_active" checked={data.is_active === true || data.is_active === 'true'}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy" />
              <label htmlFor="is_active" className="text-sm text-gray-600">Ativo (visível no site)</label>
            </div>
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
