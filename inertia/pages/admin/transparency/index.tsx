import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Layers3,
  Link2,
  Pencil,
  Plus,
  Shield,
  Trash2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Badge,
  ButtonLink,
  Card,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  RowActions,
  StatusBadge,
} from '~/components/admin/ui'

interface TransparencyLink {
  id: number
  title: string
  url: string
  display_order: number
  is_external: boolean
  is_active?: boolean
  open_mode?: string | null
}

interface Section {
  id: number
  title: string
  slug: string
  description?: string | null
  display_order: number
  is_active: boolean
  links: TransparencyLink[]
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string | number
  hint: string
  icon: typeof Shield
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold leading-none text-foreground">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function TransparencyLinkRow({
  link,
  onDelete,
}: {
  link: TransparencyLink
  onDelete: (target: { id: number; label: string }) => void
}) {
  return (
    <div className="grid gap-3 border-t border-border/70 px-4 py-3 md:grid-cols-[44px_minmax(0,1fr)_auto] md:items-center">
      <Badge tone="neutral" className="w-fit">
        {link.display_order}
      </Badge>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{link.title}</p>
          {link.is_external ? (
            <Badge tone="info">
              <ExternalLink className="h-3 w-3" />
              Externo
            </Badge>
          ) : (
            <Badge tone="navy">Interno</Badge>
          )}
          {link.open_mode === 'modal' && <Badge tone="gold">Modal</Badge>}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">{link.url || '-'}</p>
      </div>
      <RowActions>
        <IconLink tone="edit" href={`/painel/transparencia/links/${link.id}/editar`} title="Editar link">
          <Pencil className="h-4 w-4" />
        </IconLink>
        <IconButton
          tone="delete"
          title="Excluir link"
          onClick={() => onDelete({ id: link.id, label: link.title })}
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </RowActions>
    </div>
  )
}

export default function TransparencyIndex({ sections }: { sections: Section[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [sectionDelete, setSectionDelete] = useState<{ id: number; label: string } | null>(null)
  const [linkDelete, setLinkDelete] = useState<{ id: number; label: string } | null>(null)

  const totalLinks = useMemo(
    () => sections.reduce((sum, section) => sum + section.links.length, 0),
    [sections]
  )
  const activeSections = sections.filter((section) => section.is_active).length
  const externalLinks = sections.reduce(
    (sum, section) => sum + section.links.filter((link) => link.is_external).length,
    0
  )

  function toggle(id: number) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <AdminLayout title="Transparencia">
      <Head title="Transparencia - Painel" />

      <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Badge tone="navy" className="mb-3">
              Portal da Transparencia
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Transparencia</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Organize as secoes e links exibidos ao cidadao. Use links internos quando o portal
              tiver modulo proprio e links externos para sistemas contratados.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
            <ButtonLink href="/painel/acesso-informacao" variant="secondary">
              <FileText className="h-4 w-4" />
              Acesso a Informacao
            </ButtonLink>
            <CreateButton href="/painel/transparencia/secoes/criar">Nova secao</CreateButton>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard
          label="Secoes"
          value={sections.length}
          hint={`${activeSections} ativas para o publico`}
          icon={Layers3}
        />
        <StatCard
          label="Links"
          value={totalLinks}
          hint="Itens distribuidos nas secoes"
          icon={Link2}
        />
        <StatCard
          label="Externos"
          value={externalLinks}
          hint="Dependem de sistemas fora do portal"
          icon={ExternalLink}
        />
      </div>

      <div className="space-y-3">
        {sections.length === 0 ? (
          <EmptyState icon={Shield} title="Nenhuma secao cadastrada" />
        ) : (
          sections.map((section) => {
            const isExpanded = expanded[section.id]
            const internalCount = section.links.filter((link) => !link.is_external).length
            const externalCount = section.links.length - internalCount
            return (
              <Card key={section.id} padding={false} className="overflow-hidden">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <button
                    type="button"
                    onClick={() => toggle(section.id)}
                    className="flex min-w-0 items-start gap-3 text-left"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{section.title}</span>
                        <StatusBadge
                          status={section.is_active ? 'active' : 'inactive'}
                          label={section.is_active ? 'Ativa' : 'Inativa'}
                        />
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {section.links.length} link(s) · {internalCount} internos · {externalCount} externos · ordem{' '}
                        {section.display_order}
                      </span>
                      {section.description && (
                        <span className="mt-1 line-clamp-1 block text-xs text-muted-foreground">
                          {section.description}
                        </span>
                      )}
                    </span>
                  </button>
                  <RowActions>
                    <IconLink
                      tone="success"
                      href={`/painel/transparencia/secoes/${section.id}/links/criar`}
                      title="Adicionar link"
                    >
                      <Plus className="h-4 w-4" />
                    </IconLink>
                    <IconLink
                      tone="edit"
                      href={`/painel/transparencia/secoes/${section.id}/editar`}
                      title="Editar secao"
                    >
                      <Pencil className="h-4 w-4" />
                    </IconLink>
                    <IconButton
                      tone="delete"
                      title="Excluir secao"
                      onClick={() => setSectionDelete({ id: section.id, label: section.title })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </RowActions>
                </div>

                {isExpanded && (
                  <div className="bg-muted/30">
                    {section.links.length > 0 ? (
                      section.links.map((link) => (
                        <TransparencyLinkRow key={link.id} link={link} onDelete={setLinkDelete} />
                      ))
                    ) : (
                      <div className="border-t border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                        Esta secao ainda nao possui links.
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      <ConfirmDelete
        target={sectionDelete}
        onClose={() => setSectionDelete(null)}
        deleteUrl={(id) => `/painel/transparencia/secoes/${id}`}
        entity="secao"
      />
      <ConfirmDelete
        target={linkDelete}
        onClose={() => setLinkDelete(null)}
        deleteUrl={(id) => `/painel/transparencia/links/${id}`}
        entity="link"
      />
    </AdminLayout>
  )
}
