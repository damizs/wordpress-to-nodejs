import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload } from 'lucide-react'
import { useState, useRef } from 'react'

interface Props {
  councilor: any | null
  legislatures: any[]
  biennia: any[]
}

const genderOptions = ['Masculino', 'Feminino', 'Outro']
const maritalOptions = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']
const educationOptions = [
  'Ensino Fundamental Incompleto', 'Ensino Fundamental Completo',
  'Ensino Médio Incompleto', 'Ensino Médio Completo',
  'Superior Incompleto', 'Superior Completo',
  'Pós-Graduação', 'Mestrado', 'Doutorado',
]
const positionOptions = ['Vereador', 'Presidente', 'Vice-Presidente', '1º Secretário(a)', '2º Secretário(a)']

export default function CouncilorForm({ councilor, legislatures, biennia }: Props) {
  const isEditing = !!councilor
  const currentPosition = councilor?.positions?.[0]

  const { data, setData, post, processing } = useForm({
    name: councilor?.name || '',
    full_name: councilor?.full_name || '',
    parliamentary_name: councilor?.parliamentary_name || '',
    slug: councilor?.slug || '',
    party: councilor?.party || '',
    gender: councilor?.gender || '',
    marital_status: councilor?.marital_status || '',
    education_level: councilor?.education_level || '',
    email: councilor?.email || '',
    phone: councilor?.phone || '',
    bio: councilor?.bio || '',
    history: councilor?.history || '',
    role: councilor?.role || 'Vereador',
    is_active: councilor?.is_active ?? true,
    legislature_id: councilor?.legislature_id || '',
    display_order: councilor?.display_order || 0,
    biennium_id: currentPosition?.biennium_id || '',
    position: currentPosition?.position || '',
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
        {/* Dados Pessoais */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados Pessoais</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome Completo *</label>
              <input type="text" value={data.name} onChange={(e) => {
                setData('name', e.target.value)
                if (!isEditing) setData('slug', generateSlug(e.target.value))
              }} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome Parlamentar</label>
              <input type="text" value={data.parliamentary_name} onChange={(e) => setData('parliamentary_name', e.target.value)}
                placeholder="Ex: BRUNO DUARTE"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Slug</label>
              <input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Partido</label>
              <input type="text" value={data.party} onChange={(e) => setData('party', e.target.value)}
                placeholder="Ex: PP, MDB, PSD"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Gênero</label>
              <select value={data.gender} onChange={(e) => setData('gender', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="">Selecionar...</option>
                {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Estado Civil</label>
              <select value={data.marital_status} onChange={(e) => setData('marital_status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="">Selecionar...</option>
                {maritalOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Grau de Instrução</label>
              <select value={data.education_level} onChange={(e) => setData('education_level', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="">Selecionar...</option>
                {educationOptions.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ordem de Exibição</label>
              <input type="number" value={data.display_order} onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">E-mail</label>
              <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Telefone</label>
              <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Biografia</label>
            <textarea value={data.bio} onChange={(e) => setData('bio', e.target.value)}
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">História / Trajetória</label>
            <textarea value={data.history} onChange={(e) => setData('history', e.target.value)}
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.is_active}
              onChange={(e) => setData('is_active', e.target.checked)}
              className="rounded border-gray-300 text-navy focus:ring-navy" />
            <span className="text-sm text-gray-600">Ativo (em exercício)</span>
          </label>
        </div>

        {/* Legislatura e Mesa Diretora */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Legislatura e Mesa Diretora</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Legislatura</label>
              <select value={data.legislature_id} onChange={(e) => setData('legislature_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="">Selecionar...</option>
                {legislatures.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.number}ª){l.is_current ? ' ✓' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Biênio</label>
              <select value={data.biennium_id} onChange={(e) => setData('biennium_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="">Selecionar...</option>
                {biennia.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}{b.is_current ? ' ✓' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Cargo na Mesa Diretora</label>
            <select value={data.position} onChange={(e) => setData('position', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
              <option value="">Sem cargo na mesa</option>
              {positionOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Foto */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Foto</h2>
          <div className="flex items-start gap-4">
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-xl object-cover border border-gray-100" />
            )}
            <div>
              <button type="button" onClick={() => photoRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" /> {photoPreview ? 'Trocar foto' : 'Selecionar foto'}
              </button>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WebP. Máx 2MB.</p>
            </div>
          </div>
          <input ref={photoRef} type="file" accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)} className="hidden" />
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
