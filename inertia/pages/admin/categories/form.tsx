import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Tag } from 'lucide-react'
import {
  Button,
  ButtonLink,
  Field,
  FormGrid,
  FormSection,
  Input,
  PageHeader,
  Select,
} from '~/components/admin/ui'

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
    return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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

      <div className="w-full min-w-0 space-y-6">
        <PageHeader
          eyebrow="Sistema"
          icon={Tag}
          title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          description={isEditing ? `Editando: ${category?.name}` : 'Configure o tipo, nome e slug da nova categoria'}
          actions={
            <ButtonLink href="/painel/categorias" variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </ButtonLink>
          }
        />

        <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
          <FormSection
            title="Dados da Categoria"
            description="Preencha o tipo e as informações de identificação"
            icon={Tag}
            columns={1}
          >
            <Field label="Tipo" required>
              <Select value={data.type} onChange={(e) => setData('type', e.target.value)} required>
                {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </Field>

            <FormGrid cols={2}>
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
              <Field label="Slug" hint="Gerado automaticamente a partir do nome">
                <Input
                  type="text"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  className="font-mono"
                />
              </Field>
            </FormGrid>

            <FormGrid cols={2}>
              <Field label="Ordem de exibição">
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
                  <span className="text-sm text-foreground">Ativa</span>
                </label>
              </div>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <ButtonLink href="/painel/categorias" variant="secondary" className="w-full sm:w-auto">
              Cancelar
            </ButtonLink>
            <Button type="submit" loading={processing} className="w-full sm:w-auto">
              <Save className="w-4 h-4" />
              {processing ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
