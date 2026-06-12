import { Head, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  Card,
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
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

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Gerencie as categorias usadas nos formulários do sistema</p>
        <CreateButton href="/painel/categorias/criar">Nova Categoria</CreateButton>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Link
          href="/painel/categorias"
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!filters.type ? 'bg-navy text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
        >
          Todas
        </Link>
        {Object.entries(typeLabels).map(([key, label]) => (
          <Link
            key={key}
            href={`/painel/categorias?type=${key}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filters.type === key ? 'bg-navy text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {Object.entries(filters.type ? { [filters.type]: grouped[filters.type] || [] } : grouped).map(([type, cats]) => (
        <Card key={type} padding={false} className="mb-4">
          <div className="px-6 py-3 border-b border-border bg-muted/40">
            <h2 className="text-sm font-bold text-foreground">{typeLabels[type] || type}</h2>
          </div>
          <div className="divide-y divide-border/70">
            {(cats as any[]).map((cat: any) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-6">{cat.display_order}</span>
                  <span className="text-sm text-foreground">{cat.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{cat.slug}</span>
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
              <p className="px-6 py-4 text-sm text-muted-foreground">Nenhuma categoria neste tipo.</p>
            )}
          </div>
        </Card>
      ))}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/categorias/${id}`}
        entity="categoria"
      />
    </AdminLayout>
  )
}
