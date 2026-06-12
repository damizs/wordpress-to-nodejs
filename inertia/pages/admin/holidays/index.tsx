import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  IconButton,
  Input,
  Select,
} from '~/components/admin/ui'
import { CalendarDays, Flag, Plus, Trash2 } from 'lucide-react'
import { nationalHolidays } from '~/lib/holidays'

interface MunicipalHoliday {
  /** 'YYYY-MM-DD' (data única) ou 'MM-DD' (repete todo ano) */
  date: string
  label: string
  type: 'municipal' | 'estadual'
}

interface Props {
  holidays: MunicipalHoliday[]
}

const RECURRING_RE = /^\d{2}-\d{2}$/
const currentYear = new Date().getFullYear()

const isRecurring = (date: string) => RECURRING_RE.test(date)

/** Valor para o input type="date" — datas recorrentes ganham o ano atual só para exibição */
const toInputValue = (date: string) => (isRecurring(date) ? `${currentYear}-${date}` : date)

function formatNational(date: Date) {
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' })
  return { day, weekday }
}

export default function HolidaysIndex({ holidays }: Props) {
  const { data, setData, post, processing } = useForm<{ holidays: MunicipalHoliday[] }>({
    holidays: holidays,
  })

  const setItem = (i: number, patch: Partial<MunicipalHoliday>) =>
    setData(
      'holidays',
      data.holidays.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    )

  const addItem = () =>
    setData('holidays', [...data.holidays, { date: '', label: '', type: 'municipal' }])

  const removeItem = (i: number) =>
    setData(
      'holidays',
      data.holidays.filter((_, idx) => idx !== i)
    )

  /** Marca/desmarca "repete todo ano": guarda só MM-DD ou volta para data completa */
  const toggleRecurring = (i: number, recurring: boolean) => {
    const item = data.holidays[i]
    if (!item.date) return setItem(i, {})
    if (recurring && !isRecurring(item.date)) {
      setItem(i, { date: item.date.slice(5) })
    } else if (!recurring && isRecurring(item.date)) {
      setItem(i, { date: `${currentYear}-${item.date}` })
    }
  }

  const onDateChange = (i: number, value: string) => {
    const wasRecurring = isRecurring(data.holidays[i].date)
    setItem(i, { date: wasRecurring && value ? value.slice(5) : value })
  }

  function submit() {
    post('/painel/feriados', { preserveScroll: true })
  }

  const national = nationalHolidays(currentYear)

  return (
    <AdminLayout title="Feriados">
      <Head title="Feriados - Painel" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Feriados</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre os feriados municipais e estaduais. Os nacionais são calculados
            automaticamente e exibidos no site junto com os cadastrados aqui.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={submit} loading={processing}>
            Salvar alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ============ Feriados municipais/estaduais (editável) ============ */}
        <Card className="lg:col-span-2">
          <CardHeader
            icon={CalendarDays}
            title="Feriados municipais e estaduais"
            description='Marque "Repete todo ano" para datas fixas (ex.: aniversário da cidade).'
            actions={
              <Button variant="secondary" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4" />
                Adicionar feriado
              </Button>
            }
          />

          <div className="space-y-3">
            {data.holidays.map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-4 bg-muted/30">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Field label="Data" className="sm:w-44 shrink-0">
                    <Input
                      type="date"
                      value={toInputValue(item.date)}
                      onChange={(e) => onDateChange(i, e.target.value)}
                    />
                  </Field>
                  <Field label="Nome do feriado" className="sm:flex-1">
                    <Input
                      value={item.label}
                      onChange={(e) => setItem(i, { label: e.target.value })}
                      placeholder="Ex.: Emancipação de Sumé"
                    />
                  </Field>
                  <Field label="Tipo" className="sm:w-36 shrink-0">
                    <Select
                      value={item.type}
                      onChange={(e) =>
                        setItem(i, { type: e.target.value as 'municipal' | 'estadual' })
                      }
                    >
                      <option value="municipal">Municipal</option>
                      <option value="estadual">Estadual</option>
                    </Select>
                  </Field>
                  <div className="flex items-end pb-1 shrink-0">
                    <IconButton tone="delete" title="Remover feriado" onClick={() => removeItem(i)}>
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </div>

                <label className="mt-3 inline-flex items-center gap-2 text-[13px] text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isRecurring(item.date)}
                    onChange={(e) => toggleRecurring(i, e.target.checked)}
                    disabled={!item.date}
                    className="w-4 h-4 rounded border-border accent-navy focus:ring-navy/25 disabled:opacity-50"
                  />
                  Repete todo ano (guarda apenas dia e mês)
                  {isRecurring(item.date) && (
                    <Badge tone="navy" className="ml-1">
                      Anual
                    </Badge>
                  )}
                </label>
              </div>
            ))}

            {data.holidays.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-lg">
                Nenhum feriado municipal ou estadual cadastrado ainda.
              </p>
            )}
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-border">
            <Button onClick={submit} loading={processing}>
              Salvar alterações
            </Button>
          </div>
        </Card>

        {/* ============ Nacionais (somente leitura) ============ */}
        <Card>
          <CardHeader
            icon={Flag}
            title={`Feriados nacionais de ${currentYear}`}
            description="Calculados automaticamente (incluindo os móveis, derivados da Páscoa). Não precisam ser cadastrados."
          />
          <ul className="divide-y divide-border/70">
            {national.map((h, i) => {
              const { day, weekday } = formatNational(h.date)
              return (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{h.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{weekday}</p>
                  </div>
                  <Badge tone="navy">{day}</Badge>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </AdminLayout>
  )
}
