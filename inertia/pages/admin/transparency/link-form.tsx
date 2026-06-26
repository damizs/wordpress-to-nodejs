import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Link2 } from 'lucide-react'
import { Button, Field, FormSection, Input, PageHeader, Select } from '~/components/admin/ui'

interface Props {
  section: any
  link: any | null
}

export default function LinkForm({ section, link }: Props) {
  const isEditing = !!link
  const { data, setData, post, put, processing } = useForm({
    title: link?.title || '',
    url: link?.url || '',
    icon: link?.icon || '',
    display_order: link?.display_order || 0,
    is_external: link?.is_external ?? true,
    open_mode: link?.open_mode || 'nova_aba',
    hide_chrome: link?.hide_chrome ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      put(`/painel/transparencia/links/${link.id}`)
    } else {
      post(`/painel/transparencia/secoes/${section.id}/links`)
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Link' : `Novo Link → ${section.title}`}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Link - Painel`} />

      <Link href="/painel/transparencia" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar para Transparência
      </Link>

      <PageHeader
        title={isEditing ? 'Editar Link' : 'Novo Link'}
        description={`Seção: ${section.title}`}
        icon={Link2}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Dados do link" columns={2}>
          <Field label="Título" required>
            <Input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
          </Field>
          <Field label="URL" required>
            <Input type="text" value={data.url} onChange={(e) => setData('url', e.target.value)} required placeholder="https://..." />
          </Field>
          <Field label="Ícone">
            <Input type="text" value={data.icon} onChange={(e) => setData('icon', e.target.value)} placeholder="Ex: FileText" />
          </Field>
          <Field label="Ordem">
            <Input type="number" value={data.display_order} onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)} />
          </Field>
          <Field label="Abertura do link" hint="No modal, o visitante também pode abrir em outra aba">
            <Select value={data.open_mode} onChange={(e) => setData('open_mode', e.target.value)}>
              <option value="nova_aba">Nova aba</option>
              <option value="modal">Modal popup</option>
            </Select>
          </Field>
        </FormSection>

        <FormSection title="Opções adicionais">
          {data.open_mode === 'modal' && (
            <div className="flex items-center gap-2">
              <input type="checkbox" id="hide_chrome" checked={data.hide_chrome === true || data.hide_chrome === 'true'}
                onChange={(e) => setData('hide_chrome', e.target.checked)}
                className="w-4 h-4 rounded border-border text-navy" />
              <label htmlFor="hide_chrome" className="text-sm text-muted-foreground">
                Ocultar cabeçalho e rodapé (links do portal)
              </label>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_external" checked={data.is_external === true || data.is_external === 'true'}
              onChange={(e) => setData('is_external', e.target.checked)}
              className="w-4 h-4 rounded border-border text-navy" />
            <label htmlFor="is_external" className="text-sm text-muted-foreground">Link externo (abre em nova aba)</label>
          </div>
        </FormSection>

        <div className="flex justify-end">
          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
