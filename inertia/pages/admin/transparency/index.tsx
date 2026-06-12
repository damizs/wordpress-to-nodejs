import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, Shield, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import {
  Card,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  RowActions,
  StatusBadge,
} from '~/components/admin/ui'

interface Section {
  id: number
  title: string
  slug: string
  display_order: number
  is_active: boolean
  links: { id: number; title: string; url: string; display_order: number; is_external: boolean }[]
}

export default function TransparencyIndex({ sections }: { sections: Section[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [sectionDelete, setSectionDelete] = useState<{ id: number; label: string } | null>(null)
  const [linkDelete, setLinkDelete] = useState<{ id: number; label: string } | null>(null)

  function toggle(id: number) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <AdminLayout title="Transparência">
      <Head title="Transparência - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{sections.length} seção(ões) — Portal da Transparência</p>
        <CreateButton href="/painel/transparencia/secoes/criar">Nova Seção</CreateButton>
      </div>

      <div className="space-y-3">
        {sections.length === 0 ? (
          <EmptyState icon={Shield} title="Nenhuma seção cadastrada" />
        ) : (
          sections.map((section) => (
            <Card key={section.id} padding={false}>
              {/* Section header */}
              <div className="flex items-center justify-between px-5 py-4">
                <button onClick={() => toggle(section.id)} className="flex items-center gap-3 flex-1 text-left">
                  {expanded[section.id] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">{section.links.length} link(s) • Ordem: {section.display_order}</p>
                  </div>
                  <span className="ml-3">
                    <StatusBadge
                      status={section.is_active ? 'active' : 'inactive'}
                      label={section.is_active ? 'Ativa' : 'Inativa'}
                    />
                  </span>
                </button>
                <RowActions>
                  <IconLink
                    tone="success"
                    href={`/painel/transparencia/secoes/${section.id}/links/criar`}
                    title="Adicionar link"
                  >
                    <Plus className="w-4 h-4" />
                  </IconLink>
                  <IconLink tone="edit" href={`/painel/transparencia/secoes/${section.id}/editar`} title="Editar seção">
                    <Pencil className="w-4 h-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    title="Excluir seção"
                    onClick={() => setSectionDelete({ id: section.id, label: section.title })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </RowActions>
              </div>

              {/* Links list (expanded) */}
              {expanded[section.id] && section.links.length > 0 && (
                <div className="border-t border-border bg-muted/40">
                  {section.links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between px-5 py-3 border-b border-border/70 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-6">{link.display_order}</span>
                        <span className="text-sm text-foreground">{link.title}</span>
                        {link.is_external && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-xs text-sky truncate max-w-xs">{link.url}</span>
                      </div>
                      <RowActions>
                        <IconLink tone="edit" href={`/painel/transparencia/links/${link.id}/editar`} title="Editar link">
                          <Pencil className="w-3.5 h-3.5" />
                        </IconLink>
                        <IconButton
                          tone="delete"
                          title="Excluir link"
                          onClick={() => setLinkDelete({ id: link.id, label: link.title })}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </IconButton>
                      </RowActions>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      <ConfirmDelete
        target={sectionDelete}
        onClose={() => setSectionDelete(null)}
        deleteUrl={(id) => `/painel/transparencia/secoes/${id}`}
        entity="seção"
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
