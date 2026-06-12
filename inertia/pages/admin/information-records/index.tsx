import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
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
} from '~/components/admin/ui'

interface Record {
  id: number
  title: string
  category: string
  year: number
  file_url: string | null
  is_active: boolean
}

interface Props {
  records: { data: Record[]; meta: any }
  filters: { category: string; year: string }
}

const categoryLabels: { [key: string]: string } = {
  'verbas': 'Verbas Indenizatórias',
  'estagiarios': 'Estagiários',
  'terceirizados': 'Terceirizados',
  'rgf': 'RGF - Relatório Gestão Fiscal',
  'relatorio-gestao': 'Relatório de Gestão',
  'prestacao-contas': 'Prestação de Contas',
  'transferencias-recebidas': 'Transferências Recebidas',
  'transferencias-realizadas': 'Transferências Realizadas',
  'parecer-contas': 'Parecer das Contas',
  'obras': 'Obras',
  'acordos': 'Acordos e Convênios',
  'apreciacao': 'Apreciação de Contas',
  'plano-estrategico': 'Plano Estratégico',
  'concursos': 'Concursos',
  'pca': 'Plano de Contratações',
  'estrutura-organizacional': 'Estrutura Organizacional',
  'carta-servicos': 'Carta de Serviços',
}

export default function InformationRecordsIndex({ records, filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Acesso à Informação">
      <Head title="Acesso à Informação - Painel" />

      <Toolbar className="mb-6 sm:justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground whitespace-nowrap">{records.meta?.total || records.data.length} registro(s)</p>
          <Select
            value={filters.category}
            onChange={(e) => router.get('/painel/acesso-informacao', { category: e.target.value, year: filters.year }, { preserveState: true })}
            className="sm:w-64"
          >
            <option value="">Todas categorias</option>
            {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </div>
        <CreateButton href="/painel/acesso-informacao/criar">Novo Registro</CreateButton>
      </Toolbar>

      <Table>
        <THead>
          <TH>Ano</TH>
          <TH>Título</TH>
          <TH>Categoria</TH>
          <TH>Arquivo</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {records.data.length === 0 ? (
            <TableEmpty colSpan={5}>Nenhum registro cadastrado</TableEmpty>
          ) : (
            records.data.map((r) => (
              <TR key={r.id}>
                <TD>
                  <Badge tone="neutral">{r.year}</Badge>
                </TD>
                <TD className="font-medium">{r.title}</TD>
                <TD>
                  <Badge tone="navy">{categoryLabels[r.category] || r.category}</Badge>
                </TD>
                <TD>
                  {r.file_url ? (
                    <a href={r.file_url} target="_blank" rel="noopener" className="text-sky hover:text-navy">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : <span className="text-muted-foreground/50">—</span>}
                </TD>
                <TD>
                  <RowActions>
                    <IconLink tone="edit" href={`/painel/acesso-informacao/${r.id}/editar`} title="Editar">
                      <Pencil className="w-4 h-4" />
                    </IconLink>
                    <IconButton
                      tone="delete"
                      title="Excluir"
                      onClick={() => setDeleteTarget({ id: r.id, label: r.title })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </RowActions>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/acesso-informacao/${id}`}
        entity="registro"
      />
    </AdminLayout>
  )
}
