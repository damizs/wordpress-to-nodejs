import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Landmark, Save } from 'lucide-react'
import { Button, Card, CardHeader, Field, Input, PageHeader } from '~/components/admin/ui'
import RichTextEditor from '~/components/admin/RichTextEditor'

interface Entry {
  key: string
  title: string
  content: string
  page: string
  updated_at: string | null
}

interface Props {
  entries: Entry[]
}

function EntryCard({ entry }: { entry: Entry }) {
  const { data, setData, put, processing } = useForm({
    title: entry.title,
    content: entry.content,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    put(`/painel/institucional/${entry.key}`, { preserveScroll: true })
  }

  return (
    <Card>
      <CardHeader title={entry.title} description={`Página: ${entry.page}`} icon={Landmark} />
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Título" required>
          <Input
            type="text"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            required
          />
        </Field>
        <Field
          label="Conteúdo"
          required
          hint="Editor visual — negrito, listas, links e imagens (enviadas para a Biblioteca de Mídia)."
        >
          <RichTextEditor value={data.content} onChange={(html) => setData('content', html)} minHeight={280} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={processing}>
            <Save className="w-4 h-4" />
            {processing ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default function InstitutionalIndex({ entries = [] }: Props) {
  const pages = Array.from(new Set(entries.map((e) => e.page)))

  return (
    <AdminLayout title="Conteúdo Institucional">
      <Head title="Conteúdo Institucional - Painel" />
      <PageHeader
        title="Conteúdo Institucional"
        description="Edite os textos das páginas Sobre a Câmara e História da Câmara"
        icon={Landmark}
        eyebrow="Site"
      />
      <div className="w-full min-w-0 space-y-8">
        {pages.map((page) => (
          <section key={page}>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
              {page}
            </h2>
            <div className="space-y-6">
              {entries
                .filter((e) => e.page === page)
                .map((entry) => (
                  <EntryCard key={entry.key} entry={entry} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </AdminLayout>
  )
}
