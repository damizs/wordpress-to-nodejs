import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Landmark, Save } from 'lucide-react'
import { Button, Card, CardHeader, Field, Input, PageHeader, Textarea } from '~/components/admin/ui'

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

const MARKDOWN_HINT =
  'Formatação: **negrito**, *itálico*, [link](https://url), linhas com "- " viram lista e "## " vira subtítulo. Linha em branco separa parágrafos.'

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
        <Field label="Conteúdo" required hint={MARKDOWN_HINT}>
          <Textarea
            value={data.content}
            onChange={(e) => setData('content', e.target.value)}
            rows={8}
            required
          />
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
      />
      <div className="max-w-3xl space-y-8">
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
