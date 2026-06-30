import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Landmark, AlertTriangle } from 'lucide-react'
import { Button, Card, CardHeader, Field, FormGrid, Input, PageHeader } from '~/components/admin/ui'

interface Props {
  legislature: any | null
}

export default function LegislatureForm({ legislature }: Props) {
  const isEditing = !!legislature
  const { data, setData, post, processing } = useForm({
    name: legislature?.name || '',
    number: legislature?.number || '',
    start_date: legislature?.start_date || '',
    end_date: legislature?.end_date || '',
    is_current: legislature?.is_current ?? false,
  })

  // Aviso inline (não bloqueia): datas são campos `date`, então a comparação ISO é segura.
  const endBeforeStart = !!data.start_date && !!data.end_date && data.end_date < data.start_date

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/legislaturas/${legislature.id}?_method=PUT`)
    } else {
      post('/painel/legislaturas')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Legislatura' : 'Nova Legislatura'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Legislatura - Painel`} />

      <Link
        href="/painel/legislaturas"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Legislaturas
      </Link>

      <PageHeader
        icon={Landmark}
        eyebrow="Legislativo"
        title={isEditing ? 'Editar Legislatura' : 'Nova Legislatura'}
        description={
          isEditing
            ? `Editando: ${legislature?.name}`
            : 'Preencha os dados para cadastrar uma nova legislatura'
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader title="Dados da Legislatura" icon={Landmark} />

          <div className="space-y-5">
            <FormGrid cols={2}>
              <Field label="Nome" required>
                <Input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Ex: LEGISLATURA 2025/2028"
                  required
                />
              </Field>
              <Field label="Número" required>
                <Input
                  type="number"
                  value={data.number}
                  onChange={(e) => setData('number', e.target.value)}
                  placeholder="Ex: 19"
                  required
                />
              </Field>
              <Field label="Data Início" required>
                <Input
                  type="date"
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                  required
                />
              </Field>
              <Field label="Data Fim" required>
                <Input
                  type="date"
                  value={data.end_date}
                  onChange={(e) => setData('end_date', e.target.value)}
                  required
                />
              </Field>
            </FormGrid>

            {endBeforeStart && (
              <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                A <strong>Data Fim</strong> é anterior à <strong>Data Início</strong>. Verifique as
                datas.
              </p>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_current}
                onChange={(e) => setData('is_current', e.target.checked)}
                className="rounded border-border text-navy focus:ring-navy"
              />
              <span className="text-sm text-muted-foreground">Legislatura atual</span>
            </label>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={processing}>
            <Save className="w-4 h-4" />
            {processing ? 'Salvando...' : 'Salvar'}
          </Button>
          <Link
            href="/painel/legislaturas"
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </AdminLayout>
  )
}
