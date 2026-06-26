import { Head, useForm, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, FileText, UserCheck, BriefcaseBusiness } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, CardHeader, Field, Input, PageHeader, Select, Textarea } from '~/components/admin/ui'

interface LicitacaoOption {
  id: number
  title: string
  number: string | null
  year: number | null
}

interface Props {
  contract: any | null
  licitacoes: LicitacaoOption[]
}

export default function ContractForm({ contract, licitacoes }: Props) {
  const isEditing = !!contract
  const [submitting, setSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const { data, setData } = useForm({
    number: contract?.number || '',
    year: contract?.year || new Date().getFullYear(),
    status: contract?.status || 'vigente',
    licitacao_id: contract?.licitacao_id ? String(contract.licitacao_id) : '',
    object: contract?.object || '',
    modality: contract?.modality || '',
    legal_basis: contract?.legal_basis || '',
    contractor_name: contract?.contractor_name || '',
    contractor_document: contract?.contractor_document || '',
    value: contract?.value ?? '',
    sign_date: contract?.sign_date || '',
    start_date: contract?.start_date || '',
    end_date: contract?.end_date || '',
    term: contract?.term || '',
    manager_name: contract?.manager_name || '',
    manager_role: contract?.manager_role || '',
    fiscal_name: contract?.fiscal_name || '',
    fiscal_role: contract?.fiscal_role || '',
    fiscal_act: contract?.fiscal_act || '',
    content: contract?.content || '',
    notes: contract?.notes || '',
    is_active: contract?.is_active ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: Record<string, any> = { ...data, file }
    const options = {
      forceFormData: true,
      onStart: () => setSubmitting(true),
      onFinish: () => setSubmitting(false),
    }
    if (isEditing) {
      router.post(`/painel/contratos/${contract.id}?_method=PUT`, payload, options)
    } else {
      router.post('/painel/contratos', payload, options)
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Contrato' : 'Novo Contrato'}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Contrato - Painel`} />
      <Link
        href="/painel/contratos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Contratos
      </Link>

      <PageHeader
        title={isEditing ? 'Editar Contrato' : 'Novo Contrato'}
        description="Preencha os dados do contrato: identificação, contratado, vigência, gestor e fiscal (PNTP 9.1/9.3)."
        icon={BriefcaseBusiness}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificação */}
        <Card className="space-y-4">
          <CardHeader title="Identificação do contrato" icon={FileText} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Field label="Número">
              <Input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)} placeholder="012/2025" />
            </Field>
            <Field label="Ano">
              <Input type="number" value={data.year} onChange={(e) => setData('year', e.target.value)} />
            </Field>
            <Field label="Status">
              <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                <option value="vigente">Vigente</option>
                <option value="encerrado">Encerrado</option>
                <option value="rescindido">Rescindido</option>
                <option value="suspenso">Suspenso</option>
              </Select>
            </Field>
            <Field label="Valor global (R$)">
              <Input type="number" step="0.01" value={data.value} onChange={(e) => setData('value', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Modalidade">
              <Input
                type="text"
                value={data.modality}
                onChange={(e) => setData('modality', e.target.value)}
                placeholder="Dispensa, Inexigibilidade, Pregão..."
              />
            </Field>
            <Field label="Base legal">
              <Input
                type="text"
                value={data.legal_basis}
                onChange={(e) => setData('legal_basis', e.target.value)}
                placeholder="Art. 75, II, Lei 14.133/21"
              />
            </Field>
          </div>
          <Field label="Objeto">
            <Textarea value={data.object} onChange={(e) => setData('object', e.target.value)} rows={3} />
          </Field>
          <Field label="Licitação de origem (opcional)">
            <Select value={data.licitacao_id} onChange={(e) => setData('licitacao_id', e.target.value)}>
              <option value="">— Sem vínculo —</option>
              {licitacoes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.number ? `Nº ${l.number} — ` : ''}
                  {l.title}
                  {l.year ? ` (${l.year})` : ''}
                </option>
              ))}
            </Select>
          </Field>
        </Card>

        {/* Contratado + vigência */}
        <Card className="space-y-4">
          <CardHeader title="Contratado e vigência" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contratado (empresa/pessoa)">
              <Input type="text" value={data.contractor_name} onChange={(e) => setData('contractor_name', e.target.value)} />
            </Field>
            <Field label="CNPJ / CPF">
              <Input type="text" value={data.contractor_document} onChange={(e) => setData('contractor_document', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Field label="Assinatura">
              <Input type="date" value={data.sign_date} onChange={(e) => setData('sign_date', e.target.value)} />
            </Field>
            <Field label="Início da vigência">
              <Input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
            </Field>
            <Field label="Fim da vigência">
              <Input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
            </Field>
            <Field label="Vigência (texto)" hint='Ex.: "12 meses"'>
              <Input type="text" value={data.term} onChange={(e) => setData('term', e.target.value)} placeholder="12 meses" />
            </Field>
          </div>
        </Card>

        {/* Gestor + Fiscal */}
        <Card className="space-y-4">
          <CardHeader
            title="Gestor e fiscal do contrato"
            description="Exigência PNTP (item 9.3): relação dos gestores/fiscais com o ato de designação."
            icon={UserCheck}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Gestor (nome)">
              <Input type="text" value={data.manager_name} onChange={(e) => setData('manager_name', e.target.value)} placeholder="José Ribeiro de Oliveira Júnior" />
            </Field>
            <Field label="Cargo do gestor">
              <Input type="text" value={data.manager_role} onChange={(e) => setData('manager_role', e.target.value)} placeholder="Presidente da Câmara" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fiscal técnico (nome)">
              <Input type="text" value={data.fiscal_name} onChange={(e) => setData('fiscal_name', e.target.value)} placeholder="Maria Verônica Irineu de Assis" />
            </Field>
            <Field label="Cargo do fiscal">
              <Input type="text" value={data.fiscal_role} onChange={(e) => setData('fiscal_role', e.target.value)} placeholder="Chefe de Gabinete" />
            </Field>
          </div>
          <Field label="Ato de designação (portaria nº/data)">
            <Input type="text" value={data.fiscal_act} onChange={(e) => setData('fiscal_act', e.target.value)} placeholder="Portaria DV 00001/2025-03" />
          </Field>
        </Card>

        {/* Documento + extras */}
        <Card className="space-y-4">
          <CardHeader title="Inteiro teor e observações" />
          <Field label="PDF do contrato (inteiro teor)">
            <label className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg text-sm bg-card cursor-pointer hover:bg-muted max-w-md">
              <Upload className="w-4 h-4 shrink-0" />
              <span className="truncate">{file ? file.name : 'Escolher arquivo PDF'}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            {contract?.file_url && !file && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Atual:{' '}
                <a href={contract.file_url} target="_blank" rel="noopener noreferrer" className="text-navy underline">
                  ver PDF
                </a>{' '}
                — envie outro para substituir.
              </p>
            )}
          </Field>
          <Field label="Observações / aditivos (texto)">
            <Textarea value={data.content} onChange={(e) => setData('content', e.target.value)} rows={4} />
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
