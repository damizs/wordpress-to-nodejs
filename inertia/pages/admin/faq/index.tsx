import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import {
  Card,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  PageHeader,
  RowActions,
  StatusBadge,
} from '~/components/admin/ui'

interface FaqItem {
  id: number
  question: string
  answer: string
  category: string
  display_order: number
  is_active: boolean
}

const categoryLabels: Record<string, string> = {
  'LAI': 'LAI',
  'transparencia': 'Transparência',
  'sessões': 'Sessões',
  'participação': 'Participação',
  'sobre a camara': 'Sobre a Câmara',
}

export default function FaqIndex({ items }: { items: FaqItem[] }) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, FaqItem[]>)

  return (
    <AdminLayout title="Perguntas Frequentes">
      <Head title="FAQ - Painel" />

      <div className="space-y-6">
        <PageHeader
          eyebrow="Conteúdo"
          icon={HelpCircle}
          title="Perguntas Frequentes"
          description={`${items.length} pergunta(s) em ${Object.keys(grouped).length} categoria(s)`}
          variant="hero"
          actions={<CreateButton href="/painel/faq/criar">Nova Pergunta</CreateButton>}
        />

        {items.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="Nenhuma pergunta cadastrada"
            description="Crie a primeira pergunta frequente para exibir no site."
            action={<CreateButton href="/painel/faq/criar">Nova Pergunta</CreateButton>}
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, catItems]) => (
              <div key={category}>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  {categoryLabels[category] || category} ({catItems.length})
                </h3>
                <Card padding={false} className="divide-y divide-border/70">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-foreground truncate">{item.question}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.answer.replace(/<[^>]+>/g, '').substring(0, 120)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!item.is_active && <StatusBadge status="inactive" />}
                        <RowActions>
                          <IconLink tone="edit" href={`/painel/faq/${item.id}/editar`} title="Editar">
                            <Pencil className="w-4 h-4" />
                          </IconLink>
                          <IconButton
                            tone="delete"
                            title="Excluir"
                            onClick={() =>
                              setDeleteTarget({ id: item.id, label: `${item.question.substring(0, 50)}...` })
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
      </div>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/faq/${id}`}
        entity="pergunta"
      />
    </AdminLayout>
  )
}
