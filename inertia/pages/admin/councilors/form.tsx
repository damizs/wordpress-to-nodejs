import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, User, Landmark, ImageIcon } from 'lucide-react'
import { useState, useRef } from 'react'
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
} from '~/components/admin/ui'
import RichTextEditor from '~/components/admin/RichTextEditor'

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

      <Link
        href="/painel/vereadores"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader title="Dados Pessoais" icon={User} />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome Completo" required>
                <Input
                  type="text"
                  value={data.name}
                  onChange={(e) => {
                    setData('name', e.target.value)
                    if (!isEditing) setData('slug', generateSlug(e.target.value))
                  }}
                  required
                />
              </Field>
              <Field label="Nome Parlamentar">
                <Input
                  type="text"
                  value={data.parliamentary_name}
                  onChange={(e) => setData('parliamentary_name', e.target.value)}
                  placeholder="Ex: BRUNO DUARTE"
                />
              </Field>
              <Field label="Slug">
                <Input
                  type="text"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  className="font-mono"
                />
              </Field>
              <Field label="Partido">
                <Input
                  type="text"
                  value={data.party}
                  onChange={(e) => setData('party', e.target.value)}
                  placeholder="Ex: PP, MDB, PSD"
                />
              </Field>
              <Field label="Gênero">
                <Select value={data.gender} onChange={(e) => setData('gender', e.target.value)}>
                  <option value="">Selecionar...</option>
                  {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                </Select>
              </Field>
              <Field label="Estado Civil">
                <Select
                  value={data.marital_status}
                  onChange={(e) => setData('marital_status', e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {maritalOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </Field>
              <Field label="Grau de Instrução">
                <Select
                  value={data.education_level}
                  onChange={(e) => setData('education_level', e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {educationOptions.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
                </Select>
              </Field>
              <Field label="Ordem de Exibição">
                <Input
                  type="number"
                  value={data.display_order}
                  onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="E-mail">
                <Input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                />
              </Field>
              <Field label="Telefone">
                <Input
                  type="text"
                  value={data.phone}
                  onChange={(e) => setData('phone', e.target.value)}
                />
              </Field>
            </div>

            <Field label="Biografia">
              <RichTextEditor
                value={data.bio || ''}
                onChange={(html) => setData('bio', html)}
                minHeight={220}
              />
            </Field>

            <Field label="História / Trajetória">
              <RichTextEditor
                value={data.history || ''}
                onChange={(html) => setData('history', html)}
                minHeight={200}
              />
            </Field>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="rounded border-border text-navy focus:ring-navy"
              />
              <span className="text-sm text-muted-foreground">Ativo (em exercício)</span>
            </label>
          </div>
        </Card>

        {/* Legislatura e Mesa Diretora */}
        <Card>
          <CardHeader title="Legislatura e Mesa Diretora" icon={Landmark} />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Legislatura">
                <Select
                  value={data.legislature_id}
                  onChange={(e) => setData('legislature_id', e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {legislatures.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.number}ª){l.is_current ? ' ✓' : ''}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Biênio">
                <Select
                  value={data.biennium_id}
                  onChange={(e) => setData('biennium_id', e.target.value)}
                >
                  <option value="">Selecionar...</option>
                  {biennia.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}{b.is_current ? ' ✓' : ''}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Cargo na Mesa Diretora">
              <Select value={data.position} onChange={(e) => setData('position', e.target.value)}>
                <option value="">Sem cargo na mesa</option>
                {positionOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
          </div>
        </Card>

        {/* Foto */}
        <Card>
          <CardHeader title="Foto" icon={ImageIcon} />
          <div className="flex items-start gap-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-24 h-24 rounded-xl object-cover border border-border"
              />
            )}
            <div>
              <Button type="button" variant="secondary" onClick={() => photoRef.current?.click()}>
                <Upload className="w-4 h-4" /> {photoPreview ? 'Trocar foto' : 'Selecionar foto'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WebP. Máx 2MB.</p>
            </div>
          </div>
          <input
            ref={photoRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
            className="hidden"
          />
        </Card>

        <Button type="submit" loading={processing}>
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
