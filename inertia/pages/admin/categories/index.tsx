import { Head, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, Tag } from 'lucide-react'
import { useState } from 'react'
import {
  Card,
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
  PageHeader,
  RowActions,
  StatusBadge,
} from '~/components/admin/ui'

const typeLabels: Record<string, string> = {
  faq: 'FAQ',
  information_record: 'Acesso à Informação',
  publication: 'Publicações',
  session_type: 'Tipo de Sessão',
}

interface Props {
  categories: any[]
  filters: { type: string }
}

export default function CategoriesIndex({ categories, filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  const grouped = categories.reduce((acc: Record<string, any[]>, cat: any) => {
    if (!acc[cat.type]) acc[cat.type] = []
    acc[cat.type].push(cat)
    return acc
  }, {})

  return (
    <AdminLayout title="Categorias do Sistema">
      <Head title="Categorias - Painel" />

      <div className="space-y-6">
        <PageHeader
          eyebrow="Sistema"
          icon={Tag}
          title="Categorias do Sistema"
          description="Gerencie as categorias usadas nos formulários do sistema"
          variant="hero"
          actions={<CreateButton href="/painel/categorias/criar">Nova Categoria</CreateButton>}
        />

        {/* Filtro por tipo */}
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/painel/categorias"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filters.type ? 'bg-navy text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            Todas
          </Link>
          {Object.entries(typeLabels).map(([key, label]) => (
            <Link
              key={key}
              href={`/painel/categorias?type=${key}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.type === key ? 'bg-navy text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Lista de categorias agrupadas */}
        <div className="space-y-4">
          {Object.entries(filters.type ? { [filters.type]: grouped[filters.type] || [] } : grouped).map(([type, cats]) => (
            <Card key={type} padding={false}>
              <div className="px-6 py-3 border-b border-border bg-muted/40">
                <h2 className="text-sm font-bold text-foreground">{typeLabels[type] || type}</h2>
              </div>
              <div className="divide-y divide-border/70">
                {(cats as any[]).map((cat: any) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-muted-foreground w-6 shrink-0">{cat.display_order}</span>
                      <span className="text-sm text-foreground font-medium truncate">{cat.name}</span>
                      <span className="text-xs text-muted-foreground font-mono hidden sm:inline">{cat.slug}</span>
                      {!cat.is_active && <StatusBadge status="inactive" />}
                    </div>
                    <RowActions>
                      <IconLink tone="edit" href={`/painel/categorias/${cat.id}/editar`} title="Editar">
                        <Pencil className="w-4 h-4" />
                      </IconLink>
                      <IconButton
                        tone="delete"
                        title="Excluir"
                        onClick={() => setDeleteTarget({ id: cat.id, label: cat.name })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </RowActions>
                  </div>
                ))}
                {(cats as any[]).length === 0 && (
                  <p className="px-6 py-5 text-sm text-muted-foreground">Nenhuma categoria neste tipo.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/categorias/${id}`}
        entity="categoria"
      />
    </AdminLayout>
  )
}
