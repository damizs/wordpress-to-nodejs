import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  ConfirmDelete,
  Field,
  IconButton,
  Input,
  RowActions,
  Select,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Toolbar,
  Badge,
  PageHeader,
} from '~/components/admin/ui'

interface Record {
  id: number
  year: number
  month: number
  previsto: number
  recebido: number | null
  repasseDate: string | null
  documentUrl: string | null
  notes: string | null
}

interface Props {
  records: Record[]
  years: number[]
  selectedYear: number
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const brl = (v: number | null) =>
  v === null || v === undefined
    ? '—'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const formatDate = (value: string | null) => {
  if (!value) return '—'
  const iso = String(value).slice(0, 10)
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value
}

function MonthFormModal({
  open,
  onClose,
  year,
  record,
  presetMonth,
}: {
  open: boolean
  onClose: () => void
  year: number
  record: Record | null
  presetMonth: number | null
}) {
  const editing = !!record
  const month = record?.month ?? presetMonth ?? 1

  const { data, setData, post, put, processing } = useForm({
    year: String(year),
    month: String(month),
    previsto: record ? String(record.previsto ?? '') : '',
    recebido: record?.recebido != null ? String(record.recebido) : '',
    repasse_date: record?.repasseDate ? String(record.repasseDate).slice(0, 10) : '',
    document_url: record?.documentUrl ?? '',
    notes: record?.notes ?? '',
  })

  if (!open) return null

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const opts = { onSuccess: () => onClose(), preserveScroll: true }
    if (editing && record) put(`/painel/duodecimos/${record.id}`, opts)
    else post('/painel/duodecimos', opts)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-lg w-full max-w-lg border border-border animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">
            {editing ? `Editar ${MONTHS[month - 1]} de ${year}` : `Novo lançamento — ${year}`}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {!editing && (
            <Field label="Mês" required>
              <Select value={data.month} onChange={(e) => setData('month', e.target.value)}>
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Previsto (R$)" required hint="Ex.: 250000.00">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={data.previsto}
                onChange={(e) => setData('previsto', e.target.value)}
                placeholder="0,00"
              />
            </Field>
            <Field label="Recebido (R$)" hint="Deixe vazio se pendente">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={data.recebido}
                onChange={(e) => setData('recebido', e.target.value)}
                placeholder="0,00"
              />
            </Field>
          </div>
          <Field label="Data do repasse">
            <Input
              type="date"
              value={data.repasse_date}
              onChange={(e) => setData('repasse_date', e.target.value)}
            />
          </Field>
          <Field label="URL do documento" hint="Cole o link do comprovante/PDF (Biblioteca de Mídia ou externo)">
            <Input
              type="url"
              value={data.document_url}
              onChange={(e) => setData('document_url', e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Observações">
            <Input value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
          </Field>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={processing}>
              {editing ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GenerateYearForm() {
  const { data, setData, post, processing } = useForm({
    year: String(new Date().getFullYear()),
    previsto: '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/painel/duodecimos/gerar-ano', { preserveScroll: true })
  }

  return (
    <Card>
      <CardHeader
        title="Gerar ano"
        description="Cria os 12 meses de um exercício. O previsto informado é replicado em todos os meses (use o valor anual ÷ 12)."
        icon={Plus}
      />
      <form onSubmit={submit} className="flex flex-col sm:flex-row sm:items-end gap-3">
        <Field label="Ano" required className="sm:w-40">
          <Input
            type="number"
            min="1900"
            max="2200"
            value={data.year}
            onChange={(e) => setData('year', e.target.value)}
          />
        </Field>
        <Field label="Previsto mensal (R$)" hint="Opcional" className="sm:w-56">
          <Input
            type="number"
            step="0.01"
            min="0"
            value={data.previsto}
            onChange={(e) => setData('previsto', e.target.value)}
            placeholder="0,00"
          />
        </Field>
        <Button type="submit" loading={processing} className="sm:mb-[1px]">
          <Plus className="w-4 h-4" />
          Gerar 12 meses
        </Button>
      </form>
    </Card>
  )
}

export default function DuodecimosIndex({ records = [], years = [], selectedYear }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const [editTarget, setEditTarget] = useState<Record | null>(null)
  const [creating, setCreating] = useState(false)

  const yearOptions = years.includes(selectedYear) ? years : [selectedYear, ...years]

  return (
    <AdminLayout title="Duodécimos">
      <Head title="Duodécimos - Painel" />

      <PageHeader
        title="Duodécimos"
        description="Repasses mensais de 1/12 do orçamento do Executivo à Câmara (transparência ativa)."
      />

      <div className="mb-6">
        <GenerateYearForm />
      </div>

      <Toolbar className="mb-5 sm:justify-between">
        <Select
          value={selectedYear}
          onChange={(e) => router.get('/painel/duodecimos', { ano: e.target.value }, { preserveState: true })}
          className="sm:w-48"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" />
          Novo lançamento
        </Button>
      </Toolbar>

      <Table>
        <THead>
          <TH>Mês</TH>
          <TH className="text-right">Previsto</TH>
          <TH className="text-right">Recebido</TH>
          <TH>Data do Repasse</TH>
          <TH>Documento</TH>
          <TH>Situação</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {records.map((d) => (
            <TR key={d.id}>
              <TD className="font-medium">{MONTHS[d.month - 1] ?? d.month}</TD>
              <TD className="text-right tabular-nums">{brl(d.previsto)}</TD>
              <TD className="text-right tabular-nums">{brl(d.recebido)}</TD>
              <TD className="text-muted-foreground">{formatDate(d.repasseDate)}</TD>
              <TD>
                {d.documentUrl ? (
                  <a
                    href={d.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky hover:underline text-xs"
                  >
                    Ver documento
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TD>
              <TD>
                {d.recebido !== null ? (
                  <Badge tone="success">Recebido</Badge>
                ) : (
                  <Badge tone="warning">Pendente</Badge>
                )}
              </TD>
              <TD>
                <RowActions>
                  <IconButton tone="edit" title="Editar" onClick={() => setEditTarget(d)}>
                    <Pencil className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    tone="delete"
                    title="Excluir"
                    onClick={() =>
                      setDeleteTarget({ id: d.id, label: `${MONTHS[d.month - 1]} de ${d.year}` })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </RowActions>
              </TD>
            </TR>
          ))}
          {records.length === 0 && (
            <TableEmpty colSpan={7}>
              Nenhum lançamento para {selectedYear}. Use "Gerar ano" ou "Novo lançamento".
            </TableEmpty>
          )}
        </TBody>
      </Table>

      {(creating || editTarget) && (
        <MonthFormModal
          open
          onClose={() => {
            setCreating(false)
            setEditTarget(null)
          }}
          year={selectedYear}
          record={editTarget}
          presetMonth={null}
        />
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/duodecimos/${id}`}
        entity="lançamento"
      />
    </AdminLayout>
  )
}
