import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { useMemo, useState } from 'react'
import { ArrowLeft, FolderTree, Info, Layers, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDelete,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Select,
} from '~/components/admin/ui'

interface CategoryItem {
  id: number
  name: string
  slug: string
  grupo: string | null
  display_order: number
  is_active: boolean
  count: number
}

interface Props {
  categories: CategoryItem[]
}

const SEM_GRUPO = 'Sem dimensão'

export default function InformationCategoriesIndex({ categories }: Props) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  const editing = useMemo(
    () => categories.find((c) => c.id === editingId) || null,
    [categories, editingId]
  )
  const lockedSlug = !!editing && editing.count > 0

  const grupos = useMemo(
    () => Array.from(new Set(categories.map((c) => c.grupo).filter(Boolean))) as string[],
    [categories]
  )

  // Agrupa por `grupo`, preservando a ordem das categorias (já ordenadas por display_order).
  const grouped = useMemo(() => {
    const map = new Map<string, CategoryItem[]>()
    for (const c of categories) {
      const key = c.grupo?.trim() || SEM_GRUPO
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return Array.from(map.entries())
  }, [categories])

  const nextOrder = useMemo(
    () => categories.reduce((max, c) => Math.max(max, c.display_order), 0) + 1,
    [categories]
  )

  const form = useForm({
    name: '',
    slug: '',
    grupo: '',
    display_order: 0,
    is_active: true,
  })

  function openCreate() {
    setEditingId(null)
    form.clearErrors()
    form.setData({ name: '', slug: '', grupo: '', display_order: nextOrder, is_active: true })
    setOpen(true)
  }

  function openEdit(c: CategoryItem) {
    setEditingId(c.id)
    form.clearErrors()
    form.setData({
      name: c.name,
      slug: c.slug,
      grupo: c.grupo || '',
      display_order: c.display_order,
      is_active: c.is_active,
    })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const opts = { preserveScroll: true, onSuccess: () => setOpen(false) }
    if (editingId) {
      form.put(`/painel/acesso-informacao/categorias/${editingId}`, opts)
    } else {
      form.post('/painel/acesso-informacao/categorias', opts)
    }
  }

  return (
    <AdminLayout title="Categorias (Acesso à Informação)">
      <Head title="Categorias de Acesso à Informação - Painel" />

      <div className="space-y-6">
        <PageHeader
          title="Categorias de Acesso à Informação"
          description="Crie, organize e agrupe por dimensão as categorias do PNTP. Os registros e as páginas públicas referenciam a categoria pelo slug."
          icon={Tags}
          eyebrow="Estrutura PNTP"
          variant="hero"
          actions={
            <>
              <Link
                href="/painel/acesso-informacao"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar aos registros
              </Link>
              <Button type="button" variant="gold" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Nova categoria
              </Button>
            </>
          }
        />

        <div className="flex items-start gap-2.5 rounded-lg border border-sky/30 bg-sky/10 p-3 text-sm text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky" aria-hidden="true" />
          <p>
            O <strong>slug</strong> identifica a categoria nas páginas públicas (<code>/:slug</code>)
            e nos registros. Por segurança, ele só pode ser alterado enquanto a categoria não tiver
            registros. Categorias com registros não podem ser excluídas — mova ou exclua os registros
            antes.
          </p>
        </div>

        {categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="Nenhuma categoria cadastrada"
            description="Crie a primeira categoria de Acesso à Informação."
            action={
              <Button type="button" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Nova categoria
              </Button>
            }
          />
        ) : (
          <div className="space-y-5">
            {grouped.map(([grupo, items]) => (
              <Card key={grupo} padding>
                <CardHeader
                  title={grupo}
                  description={`${items.length} categoria(s) nesta dimensão`}
                  icon={Layers}
                />
                <div className="space-y-2">
                  {items.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                            c.count > 0 ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-foreground">{c.name}</p>
                            {!c.is_active && <Badge tone="neutral">Inativa</Badge>}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            <code className="rounded bg-muted px-1.5 py-0.5">{c.slug}</code>
                            <span className="ml-2">ordem {c.display_order}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={c.count > 0 ? 'success' : 'warning'}>
                          {c.count} {c.count === 1 ? 'registro' : 'registros'}
                        </Badge>
                        <IconButton tone="edit" title="Editar" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          tone="delete"
                          title={
                            c.count > 0 ? 'Há registros vinculados — não pode excluir' : 'Excluir'
                          }
                          disabled={c.count > 0}
                          className={c.count > 0 ? 'opacity-40' : ''}
                          onClick={() => setDeleteTarget({ id: c.id, label: c.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} maxWidth="max-w-lg">
        <form onSubmit={submit}>
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-bold text-foreground">
              {editingId ? 'Editar categoria' : 'Nova categoria'}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Categoria de Acesso à Informação (PNTP)
            </p>
          </div>

          <div className="space-y-4 px-6 py-5">
            <Field label="Nome" required error={form.errors.name}>
              <Input
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
                placeholder="Ex.: Verbas Indenizatórias"
                required
                autoFocus
              />
            </Field>

            <Field
              label="Slug"
              hint={
                lockedSlug
                  ? 'Bloqueado: há registros vinculados. Mova-os antes de renomear o slug.'
                  : 'Identificador na URL pública. Deixe vazio para gerar a partir do nome.'
              }
              error={form.errors.slug}
            >
              <Input
                value={form.data.slug}
                onChange={(e) => form.setData('slug', e.target.value)}
                placeholder="ex: verbas"
                readOnly={lockedSlug}
                className={lockedSlug ? 'bg-muted' : ''}
              />
            </Field>

            <Field label="Dimensão (grupo)" hint="Agrupa a categoria na visão geral.">
              <Input
                value={form.data.grupo}
                onChange={(e) => form.setData('grupo', e.target.value)}
                placeholder="Ex.: Recursos Humanos"
                list="grupos-existentes"
              />
              <datalist id="grupos-existentes">
                {grupos.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Ordem" hint="Menor aparece primeiro.">
                <Input
                  type="number"
                  min={0}
                  value={form.data.display_order}
                  onChange={(e) => form.setData('display_order', Number.parseInt(e.target.value) || 0)}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.data.is_active ? '1' : '0'}
                  onChange={(e) => form.setData('is_active', e.target.value === '1')}
                >
                  <option value="1">Ativa</option>
                  <option value="0">Inativa</option>
                </Select>
              </Field>
            </div>
          </div>

          <div className="flex gap-3 border-t border-border bg-muted/50 px-4 py-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={form.processing}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={form.processing}>
              {editingId ? 'Salvar alterações' : 'Criar categoria'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/acesso-informacao/categorias/${id}`}
        entity="categoria"
      />
    </AdminLayout>
  )
}
