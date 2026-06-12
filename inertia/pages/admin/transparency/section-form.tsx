import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'
import { Button, Card, Field, Input, Textarea } from '~/components/admin/ui'

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
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Título" required>
              <Input type="text" value={data.title} onChange={(e) => {
                setData('title', e.target.value)
                if (!isEditing) setData('slug', generateSlug(e.target.value))
              }} required />
            </Field>
            <Field label="Slug">
              <Input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="font-mono" />
            </Field>
            <Field label="Ícone">
              <Input type="text" value={data.icon} onChange={(e) => setData('icon', e.target.value)} placeholder="Ex: Shield, FileText" />
            </Field>
            <Field label="Ordem">
              <Input type="number" value={data.display_order} onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)} />
            </Field>
          </div>
          <Field label="Descrição">
            <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2} className="resize-none min-h-0" />
          </Field>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_active" checked={data.is_active === true || data.is_active === 'true'}
              onChange={(e) => setData('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-border text-navy" />
            <label htmlFor="is_active" className="text-sm text-muted-foreground">Seção ativa</label>
          </div>
        </Card>
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
