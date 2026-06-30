import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, BookA } from 'lucide-react'
import {
  Button,
  ButtonLink,
  Field,
  FormGrid,
  FormSection,
  Input,
  PageHeader,
  Textarea,
} from '~/components/admin/ui'

interface Props {
  item: any | null
}

export default function GlossaryForm({ item }: Props) {
  const isEditing = !!item
  const { data, setData, post, processing } = useForm({
    term: item?.term || '',
    definition: item?.definition || '',
    display_order: item?.display_order || 0,
    is_active: item?.is_active ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/glossario/${item.id}?_method=PUT`)
    } else {
      post('/painel/glossario')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Termo' : 'Novo Termo'}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Termo - Painel`} />

      <div className="w-full min-w-0 space-y-6">
        <PageHeader
          eyebrow="Conteúdo"
          icon={BookA}
          title={isEditing ? 'Editar Termo' : 'Novo Termo'}
          description={
            isEditing
              ? `Editando: ${item?.term?.substring(0, 80)}`
              : 'Adicione um novo verbete ao glossário legislativo do portal'
          }
          actions={
            <ButtonLink href="/painel/glossario" variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </ButtonLink>
          }
        />

        <form id="glossary-form" onSubmit={handleSubmit} className="space-y-6">
          <FormSection
            title="Dados do Termo"
            description="Informe o verbete e a sua definição. A letra do índice é calculada automaticamente."
            icon={BookA}
            columns={1}
          >
            <FormGrid cols={2}>
              <Field label="Termo / Verbete" required>
                <Input
                  type="text"
                  value={data.term}
                  onChange={(e) => setData('term', e.target.value)}
                  placeholder="Ex.: Empenho, Duodécimo, Alíquota..."
                  required
                />
              </Field>
              <Field label="Ordem de exibição" hint="Usada para ordenar empates; 0 = padrão.">
                <Input
                  type="number"
                  value={data.display_order}
                  onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                />
              </Field>
            </FormGrid>

            <Field label="Definição" required>
              <Textarea
                value={data.definition}
                onChange={(e) => setData('definition', e.target.value)}
                placeholder="Digite a definição do termo..."
                rows={6}
                required
              />
            </Field>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="rounded border-border text-navy"
              />
              <span className="text-sm text-foreground">Ativo (visível no site)</span>
            </label>
          </FormSection>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <ButtonLink href="/painel/glossario" variant="secondary" className="w-full sm:w-auto">
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
