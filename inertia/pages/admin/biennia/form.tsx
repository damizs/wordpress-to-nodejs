import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Landmark, AlertTriangle } from 'lucide-react'
import { Button, Card, CardHeader, Field, FormGrid, Input, PageHeader, Select } from '~/components/admin/ui'

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

  // Aviso inline (não bloqueia): datas são campos `date`, comparação ISO segura.
  const endBeforeStart = !!data.start_date && !!data.end_date && data.end_date < data.start_date

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
        <ArrowLeft className="w-4 h-4" /> Voltar para Biênios
      </Link>

      <PageHeader
        icon={Landmark}
        eyebrow="Legislativo"
        title={isEditing ? 'Editar Biênio' : 'Novo Biênio'}
        description={
          isEditing
            ? `Editando: ${biennium?.name}`
            : 'Preencha os dados para cadastrar um novo biênio'
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader title="Dados do Biênio" icon={Landmark} />
          <div className="space-y-5">
            <FormGrid cols={2}>
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
              <span className="text-sm text-muted-foreground">Biênio atual</span>
            </label>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={processing}>
            <Save className="w-4 h-4" />
            {processing ? 'Salvando...' : 'Salvar'}
          </Button>
          <Link
            href="/painel/bienios"
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </AdminLayout>
  )
}
