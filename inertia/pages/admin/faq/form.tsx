import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, HelpCircle } from 'lucide-react'
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
import RichTextEditor from '~/components/admin/RichTextEditor'

interface Props {
  item: any | null
  categories: any[]
}

export default function FaqForm({ item, categories = [] }: Props) {
  const isEditing = !!item
  const { data, setData, post, processing } = useForm({
    question: item?.question || '',
    answer: item?.answer || '',
    category: item?.category || (categories[0]?.slug || ''),
    display_order: item?.display_order || 0,
    is_active: item?.is_active ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/faq/${item.id}?_method=PUT`)
    } else {
      post('/painel/faq')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Pergunta' : 'Nova Pergunta'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Pergunta - Painel`} />

      <div className="w-full min-w-0 space-y-6">
        <PageHeader
          eyebrow="Conteúdo"
          icon={HelpCircle}
          title={isEditing ? 'Editar Pergunta' : 'Nova Pergunta'}
          description={isEditing ? `Editando: ${item?.question?.substring(0, 80)}` : 'Adicione uma nova pergunta frequente ao FAQ do portal'}
          actions={
            <ButtonLink href="/painel/faq" variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </ButtonLink>
          }
        />

        <form id="faq-form" onSubmit={handleSubmit} className="space-y-6">
          <FormSection
            title="Dados da Pergunta"
            description="Selecione a categoria, preencha a pergunta e a resposta"
            icon={HelpCircle}
            columns={1}
          >
            <FormGrid cols={2}>
              <Field label="Categoria" required>
                <Select value={data.category} onChange={(e) => setData('category', e.target.value)}>
                  {categories.map((c: any) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Ordem de exibição">
                <Input
                  type="number"
                  value={data.display_order}
                  onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
                />
              </Field>
            </FormGrid>

            <Field label="Pergunta" required>
              <Input
                type="text"
                value={data.question}
                onChange={(e) => setData('question', e.target.value)}
                placeholder="Digite a pergunta..."
                required
              />
            </Field>

            <Field label="Resposta" required hint="Editor visual — formatação, links e imagens.">
              <RichTextEditor
                value={data.answer}
                onChange={(html) => setData('answer', html)}
                minHeight={280}
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
            <ButtonLink href="/painel/faq" variant="secondary" className="w-full sm:w-auto">
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
