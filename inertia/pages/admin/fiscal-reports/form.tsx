import { Head, useForm, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, FileText } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, CardHeader, Field, Input, Select, Textarea } from '~/components/admin/ui'

interface Props {
  report: any | null
  types: string[]
  periodKinds: string[]
}

const PERIODS_IN: Record<string, number> = {
  bimestre: 6,
  trimestre: 4,
  quadrimestre: 3,
  semestre: 2,
  anual: 1,
}
const ORDINAL = ['', '1º', '2º', '3º', '4º', '5º', '6º']

export default function FiscalReportForm({ report, types, periodKinds }: Props) {
  const isEditing = !!report
  const [submitting, setSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const { data, setData } = useForm({
    report_type: report?.report_type || 'RGF',
    year: report?.year || new Date().getFullYear(),
    period_kind: report?.period_kind || 'quadrimestre',
    period_number: report?.period_number ? String(report.period_number) : '1',
    title: report?.title || '',
    description: report?.description || '',
    is_active: report?.is_active ?? true,
  })

  const isAnnual = data.period_kind === 'anual'
  const periodCount = PERIODS_IN[data.period_kind] ?? 1

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: Record<string, any> = { ...data, file }
    const options = {
      forceFormData: true,
      onStart: () => setSubmitting(true),
      onFinish: () => setSubmitting(false),
    }
    if (isEditing) {
      router.post(`/painel/relatorios-fiscais/${report.id}?_method=PUT`, payload, options)
    } else {
      router.post('/painel/relatorios-fiscais', payload, options)
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Relatório Fiscal' : 'Novo Relatório Fiscal'}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Relatório Fiscal - Painel`} />
      <Link
        href="/painel/relatorios-fiscais"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="admin-form">
        <Card className="space-y-4">
          <CardHeader title="Identificação do relatório" icon={FileText} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Tipo">
              <Select value={data.report_type} onChange={(e) => setData('report_type', e.target.value)}>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Ano">
              <Input type="number" value={data.year} onChange={(e) => setData('year', e.target.value)} />
            </Field>
            <Field label="Periodicidade">
              <Select
                value={data.period_kind}
                onChange={(e) => {
                  setData('period_kind', e.target.value)
                  setData('period_number', '1')
                }}
              >
                {periodKinds.map((k) => (
                  <option key={k} value={k}>
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {!isAnnual && (
            <Field label="Período" hint="Qual fração do ano este relatório cobre">
              <Select value={data.period_number} onChange={(e) => setData('period_number', e.target.value)}>
                {Array.from({ length: periodCount }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>
                    {(ORDINAL[n] ?? `${n}º`)} {data.period_kind}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="Título (opcional)" hint="Se vazio, gera automaticamente (ex.: RGF — 2º Quadrimestre/2026)">
            <Input
              type="text"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              placeholder="Deixe em branco para gerar automaticamente"
            />
          </Field>

          <Field label="Observações (opcional)">
            <Textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={3}
            />
          </Field>
        </Card>

        <Card className="space-y-4">
          <CardHeader title="Arquivo (PDF)" />
          <Field label="PDF do relatório e anexos">
            <label className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg text-sm bg-card cursor-pointer hover:bg-muted max-w-md">
              <Upload className="w-4 h-4 shrink-0" />
              <span className="truncate">{file ? file.name : 'Escolher arquivo PDF'}</span>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
            {report?.file_url && !file && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Atual:{' '}
                <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="text-navy dark:text-sky underline">
                  ver PDF
                </a>{' '}
                — envie outro para substituir.
              </p>
            )}
          </Field>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={data.is_active}
              onChange={(e) => setData('is_active', e.target.checked)}
              className="accent-[hsl(var(--navy))]"
            />
            Publicado (visível no site)
          </label>
        </Card>

        <Button type="submit" loading={submitting}>
          {!submitting && <Save className="w-4 h-4" />}
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
