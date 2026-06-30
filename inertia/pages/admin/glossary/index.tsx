import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, BookA } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Card,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  PageHeader,
  RowActions,
  SearchInput,
  StatusBadge,
} from '~/components/admin/ui'

interface GlossaryItem {
  id: number
  term: string
  definition: string
  letter: string | null
  slug: string | null
  display_order: number
  is_active: boolean
}

function letterOf(item: GlossaryItem) {
  return (item.letter || item.term.charAt(0) || '#').toUpperCase()
}

export default function GlossaryIndex({ items }: { items: GlossaryItem[] }) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    if (!q) return items
    return items.filter((i) =>
      `${i.term} ${i.definition}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(q)
    )
  }, [items, query])

  // Agrupa por letra inicial
  const grouped = useMemo(() => {
    const acc: Record<string, GlossaryItem[]> = {}
    for (const item of filtered) {
      const l = letterOf(item)
      if (!acc[l]) acc[l] = []
      acc[l].push(item)
    }
    return Object.entries(acc).sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
  }, [filtered])

  return (
    <AdminLayout title="Glossário">
      <Head title="Glossário - Painel" />

      <div className="space-y-6">
        <PageHeader
          eyebrow="Conteúdo"
          icon={BookA}
          title="Glossário Legislativo"
          description={`${items.length} termo(s) em ${
            new Set(items.map(letterOf)).size
          } letra(s)`}
          variant="hero"
          actions={<CreateButton href="/painel/glossario/criar">Novo Termo</CreateButton>}
        />

        {items.length === 0 ? (
          <EmptyState
            icon={BookA}
            title="Nenhum termo cadastrado"
            description="Cadastre o primeiro termo do glossário legislativo para exibir no site."
            action={<CreateButton href="/painel/glossario/criar">Novo Termo</CreateButton>}
          />
        ) : (
          <>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar termo ou definição..."
              className="max-w-md"
            />

            {grouped.length === 0 ? (
              <Card>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum termo encontrado para &ldquo;{query}&rdquo;.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {grouped.map(([letter, group]) => (
                  <div key={letter}>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                      {letter} ({group.length})
                    </h3>
                    <Card padding={false} className="divide-y divide-border/70">
                      {group.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.term}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {item.definition}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!item.is_active && <StatusBadge status="inactive" />}
                            <RowActions>
                              <IconLink
                                tone="edit"
                                href={`/painel/glossario/${item.id}/editar`}
                                title="Editar"
                              >
                                <Pencil className="w-4 h-4" />
                              </IconLink>
                              <IconButton
                                tone="delete"
                                title="Excluir"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: item.id,
                                    label: item.term,
                                  })
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </IconButton>
                            </RowActions>
                          </div>
                        </div>
                      ))}
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/glossario/${id}`}
        entity="termo"
      />
    </AdminLayout>
  )
}
