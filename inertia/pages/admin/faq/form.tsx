import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'
import { Button, Card, CardHeader, Field, Input, Select } from '~/components/admin/ui'
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
      <Link
        href="/painel/faq"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <form onSubmit={handleSubmit} className="admin-form">
        <Card>
          <CardHeader title="Dados da Pergunta" />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
            <Field label="Pergunta" required>
              <Input
                type="text"
                value={data.question}
                onChange={(e) => setData('question', e.target.value)}
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
              <span className="text-sm text-muted-foreground">Ativo (visível no site)</span>
            </label>
          </div>
        </Card>
        <Button type="submit" loading={processing}>
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
