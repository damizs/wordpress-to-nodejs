import { Head, useForm, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Save,
  ArrowLeft,
  Upload,
  FileText,
  UserCheck,
  BriefcaseBusiness,
  AlertTriangle,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Button, Card, CardHeader, Field, Input, PageHeader, Select, Textarea } from '~/components/admin/ui'
import { maskCpfCnpj } from '~/lib/masks'
import { useUnsavedChanges } from '~/hooks/use_unsaved_changes'

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

/**
 * Modalidades de contratação (Lei 14.133/2021 + legado 8.666/93), alinhadas às
 * opções do módulo de Licitações. Texto legível porque o valor é exibido tal qual
 * na página pública do contrato.
 */
const MODALITY_OPTIONS = [
  'Pregão Eletrônico',
  'Pregão Presencial',
  'Concorrência',
  'Concurso',
  'Leilão',
  'Diálogo Competitivo',
  'Dispensa',
  'Inexigibilidade',
  'Tomada de Preços',
  'Convite',
]

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

  // Aviso inline (não bloqueia): só compara quando as duas são datas reais.
  const endBeforeStart =
    !!data.start_date && !!data.end_date && data.end_date < data.start_date

  // Campos recomendados pela ATRICON/PNTP (9.1/9.3) — aviso suave, NÃO bloqueia o salvar.
  const missingAtricon = [
    !String(data.manager_name).trim() && 'Gestor',
    !String(data.fiscal_name).trim() && 'Fiscal técnico',
    !String(data.fiscal_act).trim() && 'Ato de designação (portaria)',
  ].filter(Boolean) as string[]

  // Alterações não salvas: campos (sem o arquivo) + arquivo selecionado.
  const snapshot = () => JSON.stringify(data)
  const initialSnapshot = useRef(snapshot())
  const dirty = (snapshot() !== initialSnapshot.current || file !== null) && !submitting
  useUnsavedChanges(dirty)

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
        {/* Aviso suave (não bloqueante): campos recomendados pela ATRICON/PNTP em branco. */}
        {missingAtricon.length > 0 && (
          <div
            role="status"
            className="rounded-lg border border-l-4 border-l-amber-500 bg-amber-500/10 p-4 text-sm"
          >
            <p className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Atenção — campos exigidos pela ATRICON em branco:</strong>{' '}
                {missingAtricon.join(' / ')}. Você pode salvar assim mesmo e preencher
                depois, mas a matriz PNTP (itens 9.1/9.3) recomenda informar gestor,
                fiscal e o ato de designação.
              </span>
            </p>
          </div>
        )}

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
            <Field
              label="Modalidade"
              hint="Forma de contratação usada (Lei 14.133/2021). Padroniza o dado para o site e os relatórios."
            >
              <Select value={data.modality} onChange={(e) => setData('modality', e.target.value)}>
                <option value="">Selecionar...</option>
                {/* Mantém o valor já salvo mesmo que não esteja na lista (não perde dado antigo). */}
                {data.modality && !MODALITY_OPTIONS.includes(data.modality) && (
                  <option value={data.modality}>{data.modality} (valor atual)</option>
                )}
                {MODALITY_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Base legal"
              hint="Artigo/lei que fundamenta a contratação. Ex.: Art. 75, II, Lei 14.133/21."
            >
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
            <Field label="CNPJ / CPF" hint="Formato automático conforme a quantidade de dígitos.">
              <Input
                type="text"
                inputMode="numeric"
                value={data.contractor_document}
                onChange={(e) => setData('contractor_document', maskCpfCnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
              />
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
          {endBeforeStart && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              O <strong>Fim da vigência</strong> é anterior ao <strong>Início da vigência</strong>.
              Verifique as datas (ou use o campo de texto livre).
            </p>
          )}
        </Card>

        {/* Gestor + Fiscal */}
        <Card className="space-y-4">
          <CardHeader
            title="Gestor e fiscal do contrato"
            description="Exigência PNTP (item 9.3): relação dos gestores/fiscais com o ato de designação."
            icon={UserCheck}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Gestor (nome)"
              hint="Recomendado pela ATRICON/PNTP 9.3 — fiscalização do contrato. Responsável pela gestão administrativa (prazos, aditivos, pagamentos)."
            >
              <Input type="text" value={data.manager_name} onChange={(e) => setData('manager_name', e.target.value)} placeholder="José Ribeiro de Oliveira Júnior" />
            </Field>
            <Field label="Cargo do gestor">
              <Input type="text" value={data.manager_role} onChange={(e) => setData('manager_role', e.target.value)} placeholder="Presidente da Câmara" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Fiscal técnico (nome)"
              hint="Recomendado pela ATRICON/PNTP 9.3 — fiscalização do contrato. Acompanha a execução técnica e atesta a entrega (diferente do gestor)."
            >
              <Input type="text" value={data.fiscal_name} onChange={(e) => setData('fiscal_name', e.target.value)} placeholder="Maria Verônica Irineu de Assis" />
            </Field>
            <Field label="Cargo do fiscal">
              <Input type="text" value={data.fiscal_role} onChange={(e) => setData('fiscal_role', e.target.value)} placeholder="Chefe de Gabinete" />
            </Field>
          </div>
          <Field
            label="Ato de designação (portaria nº/data)"
            hint="Recomendado pela ATRICON/PNTP 9.3 — portaria/ato que nomeou o gestor e o fiscal."
          >
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
