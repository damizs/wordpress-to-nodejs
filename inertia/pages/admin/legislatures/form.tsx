import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Landmark } from 'lucide-react'
import { Button, Card, CardHeader, Field, Input } from '~/components/admin/ui'

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
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader title="Dados da Legislatura" icon={Landmark} />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

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

        <Button type="submit" loading={processing}>
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
