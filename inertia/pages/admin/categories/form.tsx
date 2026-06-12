import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'
import { Button, Card, Field, Input, Select } from '~/components/admin/ui'

const typeOptions = [
  { value: 'faq', label: 'FAQ' },
  { value: 'information_record', label: 'Acesso à Informação' },
  { value: 'publication', label: 'Publicações' },
  { value: 'session_type', label: 'Tipo de Sessão' },
]

interface Props {
  category: any | null
}

export default function CategoryForm({ category }: Props) {
  const isEditing = !!category

  const { data, setData, post, processing } = useForm({
    type: category?.type || 'faq',
    name: category?.name || '',
    slug: category?.slug || '',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
  })

  function generateSlug(name: string) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/categorias/${category.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/categorias', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Categoria - Painel`} />

      <Link
        href="/painel/categorias"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-xl">
        <Card className="space-y-4">
          <Field label="Tipo" required>
            <Select value={data.type} onChange={(e) => setData('type', e.target.value)} required>
              {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome" required>
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
            <Field label="Slug">
              <Input
                type="text"
                value={data.slug}
                onChange={(e) => setData('slug', e.target.value)}
                className="font-mono"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ordem">
              <Input
                type="number"
                value={data.display_order}
                onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
              />
            </Field>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="rounded border-border text-navy"
                />
                <span className="text-sm text-muted-foreground">Ativa</span>
              </label>
            </div>
          </div>
        </Card>

        <Button type="submit" loading={processing} className="mt-4">
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
