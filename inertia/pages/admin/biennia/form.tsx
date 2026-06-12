import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Landmark } from 'lucide-react'
import { Button, Card, CardHeader, Field, Input, Select } from '~/components/admin/ui'

interface Props {
  biennium: any | null
  legislatures: any[]
}

export default function BienniumForm({ biennium, legislatures }: Props) {
  const isEditing = !!biennium

  const { data, setData, post, processing } = useForm({
    name: biennium?.name || '',
    legislature_id: biennium?.legislature_id || '',
    start_date: biennium?.start_date || '',
    end_date: biennium?.end_date || '',
    is_current: biennium?.is_current ?? false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/bienios/${biennium.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/bienios', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Biênio' : 'Novo Biênio'}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Biênio - Painel`} />

      <Link
        href="/painel/bienios"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-xl">
        <Card>
          <CardHeader title="Dados do Biênio" icon={Landmark} />
          <div className="space-y-4">
            <Field label="Nome" required>
              <Input
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
                placeholder="Ex: BIÊNIO - 2025/2026"
              />
            </Field>
            <Field label="Legislatura" required>
              <Select
                value={data.legislature_id}
                onChange={(e) => setData('legislature_id', e.target.value)}
                required
              >
                <option value="">Selecionar...</option>
                {legislatures.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.number}ª){l.is_current ? ' ✓' : ''}</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
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
              <span className="text-sm text-muted-foreground">Biênio atual</span>
            </label>
          </div>
        </Card>

        <Button type="submit" loading={processing} className="mt-4">
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
