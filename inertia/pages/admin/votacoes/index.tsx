import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Vote, Pencil, Trash2, Sparkles, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  type BadgeTone,
  ButtonLink,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  PageHeader,
  Pagination,
  RowActions,
  Select,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  Toolbar,
  TR,
} from '~/components/admin/ui'

interface Voting {
  id: number
  title: string
  voting_date: string
  year: number
  result: string
  is_unanimous: boolean
  is_published: boolean
  source: string
  session_title: string | null
  votes_count: number
}

interface Props {
  votings: { data: Voting[]; meta: { total: number; currentPage: number; lastPage: number } }
  years: number[]
  filters: { year: string }
}

const resultLabels: Record<string, { label: string; tone: BadgeTone }> = {
  aprovado: { label: 'Aprovado', tone: 'success' },
  rejeitado: { label: 'Rejeitado', tone: 'danger' },
  retirado: { label: 'Retirado', tone: 'neutral' },
  adiado: { label: 'Adiado', tone: 'warning' },
  outro: { label: 'Outro', tone: 'neutral' },
}

const sourceLabels: Record<string, string> = {
  manual: 'Manual',
  ata_ia: 'Ata (IA)',
  api: 'Sistema de votação',
}

export default function VotingsIndex({ votings, years = [], filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  const baseUrl = filters.year ? `/painel/votacoes?year=${filters.year}` : '/painel/votacoes'

  return (
    <AdminLayout title="Votações Nominais">
      <Head title="Votações Nominais - Painel" />

      <PageHeader
        title="Votações Nominais"
        description="Registro das votações das sessões plenárias, com o voto de cada vereador."
        icon={Vote}
        eyebrow="Legislativo"
        variant="hero"
        actions={
          <>
            <ButtonLink href="/painel/votacoes/importar" variant="secondary">
              <Sparkles className="w-4 h-4" /> Importar da Ata (IA)
            </ButtonLink>
            <CreateButton href="/painel/votacoes/criar">Nova Votação</CreateButton>
          </>
        }
      />

      <Toolbar>
        <Select
          value={filters.year}
          onChange={(e) =>
            router.get('/painel/votacoes', { year: e.target.value }, { preserveState: true })
          }
          className="sm:w-40"
        >
          <option value="">Todos os anos</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
        <span className="text-sm text-muted-foreground hidden sm:inline self-center">
          {votings.meta?.total ?? votings.data.length} votação(ões)
        </span>
      </Toolbar>

      {votings.data.length === 0 && !filters.year ? (
        <EmptyState
          icon={Vote}
          title="Nenhuma votação cadastrada"
          description="Cadastre manualmente ou importe das atas com IA."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <ButtonLink href="/painel/votacoes/importar" variant="secondary">
                <Sparkles className="w-4 h-4" /> Importar da Ata (IA)
              </ButtonLink>
              <CreateButton href="/painel/votacoes/criar">Nova Votação</CreateButton>
            </div>
          }
        />
      ) : (
        <Table
          footer={
            votings.meta ? (
              <Pagination
                meta={{
                  total: votings.meta.total,
                  current_page: votings.meta.currentPage,
                  last_page: votings.meta.lastPage,
                }}
                baseUrl={baseUrl}
                itemLabel="votação"
                itemLabelPlural="votações"
              />
            ) : undefined
          }
        >
          <THead>
            <TH>Data</TH>
            <TH>Matéria</TH>
            <TH>Resultado</TH>
            <TH>Votos</TH>
            <TH>Origem</TH>
            <TH>Publicada</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {votings.data.length === 0 && (
              <TableEmpty colSpan={7}>Nenhuma votação encontrada para os filtros selecionados.</TableEmpty>
            )}
            {votings.data.map((v) => {
              const result = resultLabels[v.result] || resultLabels.outro
              return (
                <TR key={v.id}>
                  <TD className="text-muted-foreground whitespace-nowrap">
                    {new Date(v.voting_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </TD>
                  <TD className="font-medium">
                    <p className="line-clamp-2">{v.title}</p>
                    {v.session_title && (
                      <p className="text-xs text-muted-foreground mt-0.5">{v.session_title}</p>
                    )}
                  </TD>
                  <TD>
                    <Badge tone={result.tone}>{result.label}</Badge>
                    {v.is_unanimous && (
                      <Badge tone="info" className="ml-1">
                        Unânime
                      </Badge>
                    )}
                  </TD>
                  <TD className="text-muted-foreground">{v.votes_count}</TD>
                  <TD className="text-muted-foreground">{sourceLabels[v.source] || v.source}</TD>
                  <TD>
                    {v.is_published ? (
                      <Badge tone="success">
                        <Eye className="w-3.5 h-3.5" /> Sim
                      </Badge>
                    ) : (
                      <Badge tone="neutral">
                        <EyeOff className="w-3.5 h-3.5" /> Não
                      </Badge>
                    )}
                  </TD>
                  <TD>
                    <RowActions>
                      <IconLink tone="edit" href={`/painel/votacoes/${v.id}/editar`} title="Editar">
                        <Pencil className="w-4 h-4" />
                      </IconLink>
                      <IconButton
                        tone="delete"
                        onClick={() => setDeleteTarget({ id: v.id, label: v.title })}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </RowActions>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/votacoes/${id}`}
        entity="votação"
      />
    </AdminLayout>
  )
}
