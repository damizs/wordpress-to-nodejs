import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Layers3, Info } from 'lucide-react'
import { Button, Field, FormSection, Input, PageHeader, Textarea } from '~/components/admin/ui'
import IconPicker from '~/components/admin/IconPicker'

export default function SectionForm({ section }: { section: any | null }) {
  const isEditing = !!section
  const { data, setData, post, put, processing } = useForm({
    title: section?.title || '',
    slug: section?.slug || '',
    icon: section?.icon || '',
    description: section?.description || '',
    display_order: section?.display_order || 0,
    is_active: section?.is_active ?? true,
  })

  function generateSlug(title: string) {
    return title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      put(`/painel/transparencia/secoes/${section.id}`)
    } else {
      post('/painel/transparencia/secoes')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Seção' : 'Nova Seção'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Seção - Painel`} />

      <Link href="/painel/transparencia" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar para Transparência
      </Link>

      <PageHeader
        title={isEditing ? 'Editar Seção' : 'Nova Seção'}
        description="Configure o título, slug e visibilidade desta seção no portal de transparência."
        icon={Layers3}
      />

      <div className="flex items-start gap-2.5 mb-5 rounded-lg border border-sky/30 bg-sky/10 p-3 text-sm text-foreground">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-sky" aria-hidden="true" />
        <p>
          <strong>Portal da Transparência</strong> = links (em geral externos) organizados por
          seção. Aparece no site em <strong>/transparencia</strong>. Para documentos internos
          por ano (LAI/PNTP), use o módulo <strong>Acesso à Informação</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Identificação" columns={2}>
          <Field label="Título" required>
            <Input type="text" value={data.title} onChange={(e) => {
              setData('title', e.target.value)
              if (!isEditing) setData('slug', generateSlug(e.target.value))
            }} required />
          </Field>
          <Field label="Slug">
            <Input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="font-mono" />
          </Field>
          <Field label="Ícone" hint="Busque e clique no ícone que representa a seção.">
            <IconPicker value={data.icon} onChange={(name) => setData('icon', name)} />
          </Field>
          <Field label="Ordem">
            <Input type="number" value={data.display_order} onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)} />
          </Field>
        </FormSection>

        <FormSection title="Detalhes e visibilidade">
          <Field label="Descrição">
            <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2} className="resize-none min-h-0" />
          </Field>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={data.is_active === true || data.is_active === 'true'}
              onChange={(e) => setData('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-border text-navy" />
            <label htmlFor="is_active" className="text-sm text-muted-foreground">Seção ativa (visível no portal)</label>
          </div>
        </FormSection>

        <div className="flex justify-end">
          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
