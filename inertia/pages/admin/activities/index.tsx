import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ScrollText, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  PageHeader,
  Pagination,
  RowActions,
  SearchInput,
  Select,
  StatusBadge,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  Toolbar,
  TR,
} from '~/components/admin/ui'

interface Props {
  activities: {
    data: any[]
    meta: { total: number; per_page: number; current_page: number; last_page: number }
  }
  filters: { type: string; year: string; origin: string; search: string }
  types: string[]
  years: number[]
  origins: { value: string; label: string }[]
}

function originLabel(origin: string | null | undefined, origins: { value: string; label: string }[]) {
  return origins.find((item) => item.value === origin)?.label || 'Origem não informada'
}

function originTone(origin: string | null | undefined) {
  if (origin === 'executivo') return 'info' as const
  if (origin === 'legislativo') return 'success' as const
  return 'neutral' as const
}

export default function ActivitiesIndex({ activities, filters, types, years, origins }: Props) {
  const [search, setSearch] = useState(filters.search)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  function handleFilter(field: string, value: string) {
    router.get('/painel/atividades', { ...filters, [field]: value, page: 1 }, { preserveState: true })
  }

  const { data, meta } = activities

  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.year) params.set('year', filters.year)
  if (filters.origin) params.set('origin', filters.origin)
  if (filters.search) params.set('search', filters.search)
  const baseUrl = `/painel/atividades${params.toString() ? `?${params.toString()}` : ''}`

  const hasActiveFilters = Boolean(filters.type || filters.year || filters.origin || filters.search)

  return (
    <AdminLayout title="Atividades Legislativas">
      <Head title="Atividades Legislativas - Painel" />

      <PageHeader
        title="Atividades Legislativas"
        description="Projetos de lei, requerimentos, indicações e demais matérias legislativas."
        icon={ScrollText}
        eyebrow="Legislativo"
        variant="hero"
        actions={<CreateButton href="/painel/atividades/criar">Nova Atividade</CreateButton>}
      />

      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          onSearch={() => handleFilter('search', search)}
          placeholder="Buscar..."
          className="sm:flex-1 sm:max-w-xs"
        />
        <Select
          value={filters.type}
          onChange={(e) => handleFilter('type', e.target.value)}
          className="sm:w-48"
        >
          <option value="">Todos os tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select
          value={filters.origin}
          onChange={(e) => handleFilter('origin', e.target.value)}
          className="sm:w-48"
        >
          <option value="">Todas as origens</option>
          {origins.map((origin) => (
            <option key={origin.value} value={origin.value}>
              {origin.label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.year}
          onChange={(e) => handleFilter('year', e.target.value)}
          className="sm:w-36"
        >
          <option value="">Todos os anos</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </Toolbar>

      {data.length === 0 && !hasActiveFilters ? (
        <EmptyState
          icon={ScrollText}
          title="Nenhuma atividade legislativa cadastrada"
          description="Cadastre projetos de lei, requerimentos e outras matérias."
          action={<CreateButton href="/painel/atividades/criar">Nova Atividade</CreateButton>}
        />
      ) : (
        <Table footer={<Pagination meta={meta} baseUrl={baseUrl} itemLabel="atividade" />}>
          <THead>
            <TH>Tipo</TH>
            <TH>Origem</TH>
            <TH>Nº/Ano</TH>
            <TH>Ementa</TH>
            <TH>Status</TH>
            <TH>Autor</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {data.length === 0 && (
              <TableEmpty colSpan={7}>Nenhuma atividade encontrada para os filtros selecionados.</TableEmpty>
            )}
            {data.map((a: any) => (
              <TR key={a.id}>
                <TD>
                  <Badge tone="navy">{a.type}</Badge>
                </TD>
                <TD>
                  <Badge tone={originTone(a.origin)}>{originLabel(a.origin, origins)}</Badge>
                </TD>
                <TD className="font-medium whitespace-nowrap">
                  {a.number}/{a.year}
                </TD>
                <TD className="text-muted-foreground max-w-md truncate">{a.summary}</TD>
                <TD>
                  <StatusBadge status={a.status} />
                </TD>
                <TD className="text-muted-foreground">{a.author || '—'}</TD>
                <TD>
                  <RowActions>
                    <IconLink tone="edit" href={`/painel/atividades/${a.id}/editar`} title="Editar">
                      <Pencil className="w-4 h-4" />
                    </IconLink>
                    <IconButton
                      tone="delete"
                      onClick={() =>
                        setDeleteTarget({ id: a.id, label: `${a.type} ${a.number}/${a.year}` })
                      }
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </RowActions>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/atividades/${id}`}
        entity="atividade"
      />
    </AdminLayout>
  )
}
