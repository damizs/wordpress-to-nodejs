import { Head, useForm, router } from '@inertiajs/react'
import { useState, type ReactNode } from 'react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Button,
  Card,
  CardHeader,
  IconButton,
  Input,
  PageHeader,
} from '~/components/admin/ui'
import {
  CornerDownRight,
  GripVertical,
  Link2,
  Menu as MenuIcon,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface MenuChild {
  label: string
  href: string
}

interface MenuItem {
  label: string
  href: string
  children?: MenuChild[]
}

interface FooterColumn {
  title: string
  links: MenuChild[]
}

interface Props {
  headerMenu: MenuItem[]
  footerColumns: FooterColumn[]
  /** Agrupamento automático de Matérias/Licitações ligado? (setting menu_auto_group) */
  menuAutoGroup: boolean
}

/* IDs estáveis no cliente para o drag-and-drop (o servidor ignora `_id`). */
let _uid = 0
const nextId = () => `m${++_uid}`

interface IChild extends MenuChild {
  _id: string
}
interface IItem {
  _id: string
  label: string
  href: string
  children?: IChild[]
}
interface ILink extends MenuChild {
  _id: string
}
interface IColumn {
  _id: string
  title: string
  links: ILink[]
}

function toItems(items: MenuItem[]): IItem[] {
  return items.map((it) => ({
    _id: nextId(),
    label: it.label,
    href: it.href,
    children: it.children?.map((c) => ({ _id: nextId(), label: c.label, href: c.href })),
  }))
}

function toColumns(cols: FooterColumn[]): IColumn[] {
  return cols.map((c) => ({
    _id: nextId(),
    title: c.title,
    links: c.links.map((l) => ({ _id: nextId(), label: l.label, href: l.href })),
  }))
}

/** Linha arrastável: entrega a "alça" (handle) ao filho via render-prop. */
function SortableRow({
  id,
  children,
}: {
  id: string
  children: (handle: ReactNode) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 20 : undefined,
    position: isDragging ? 'relative' : undefined,
  }
  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      title="Arraste para reordenar"
      aria-label="Arraste para reordenar"
      className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none shrink-0 p-1"
    >
      <GripVertical className="w-4 h-4" />
    </button>
  )
  return (
    <div ref={setNodeRef} style={style}>
      {children(handle)}
    </div>
  )
}

export default function MenusIndex({ headerMenu, footerColumns, menuAutoGroup }: Props) {
  const [initial] = useState(() => ({
    header_menu: toItems(headerMenu),
    footer_columns: toColumns(footerColumns),
    menu_auto_group: menuAutoGroup,
  }))
  const { data, setData, post, processing } = useForm(initial)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  /* ---------- header menu helpers ---------- */
  const setItem = (i: number, patch: Partial<IItem>) =>
    setData(
      'header_menu',
      data.header_menu.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    )

  const setChild = (i: number, ci: number, patch: Partial<IChild>) =>
    setItem(i, {
      children: (data.header_menu[i].children ?? []).map((c, idx) =>
        idx === ci ? { ...c, ...patch } : c
      ),
    })

  function onDragEndHeader(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldI = data.header_menu.findIndex((x) => x._id === active.id)
    const newI = data.header_menu.findIndex((x) => x._id === over.id)
    if (oldI !== -1 && newI !== -1) setData('header_menu', arrayMove(data.header_menu, oldI, newI))
  }

  function onDragEndChildren(i: number, e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const children = data.header_menu[i].children ?? []
    const oldI = children.findIndex((x) => x._id === active.id)
    const newI = children.findIndex((x) => x._id === over.id)
    if (oldI !== -1 && newI !== -1) setItem(i, { children: arrayMove(children, oldI, newI) })
  }

  /* ---------- footer helpers ---------- */
  const setColumn = (i: number, patch: Partial<IColumn>) =>
    setData(
      'footer_columns',
      data.footer_columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    )

  function onDragEndLinks(i: number, e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const links = data.footer_columns[i].links
    const oldI = links.findIndex((x) => x._id === active.id)
    const newI = links.findIndex((x) => x._id === over.id)
    if (oldI !== -1 && newI !== -1) setColumn(i, { links: arrayMove(links, oldI, newI) })
  }

  function submit() {
    post('/painel/menus', { preserveScroll: true })
  }

  function restoreDefaults() {
    router.post('/painel/menus/restaurar', {}, { preserveScroll: true })
  }

  const urlHint = 'Use caminhos internos (/vereadores) ou URLs completas (https://...)'

  return (
    <AdminLayout title="Menus do Site">
      <Head title="Menus do Site - Painel" />

      <PageHeader
        title="Menus do Site"
        description="Controle os itens do menu principal (header) e as colunas de links do rodapé."
        icon={MenuIcon}
        eyebrow="Site"
        actions={
          <>
            <Button variant="secondary" onClick={restoreDefaults} disabled={processing}>
              <RotateCcw className="w-4 h-4" />
              Restaurar padrão
            </Button>
            <Button onClick={submit} loading={processing}>
              Salvar alterações
            </Button>
          </>
        }
      />

      {/* ===================== Menu principal ===================== */}
      <Card className="mb-6">
        <CardHeader
          icon={MenuIcon}
          title="Menu principal (header)"
          description="Arraste pela alça (à esquerda) para reordenar. Itens com subitens viram dropdown — a ordem aqui é a ordem no site."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setData('header_menu', [
                  ...data.header_menu,
                  { _id: nextId(), label: '', href: '/' },
                ])
              }
            >
              <Plus className="w-4 h-4" />
              Adicionar item
            </Button>
          }
        />

        {/* Agrupamento automático (Matérias/Licitações) — opcional */}
        <label className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={data.menu_auto_group}
            onChange={(e) => setData('menu_auto_group', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-border accent-navy"
          />
          <span className="min-w-0">
            <span className="text-sm font-semibold text-foreground">
              Agrupar “Matérias” e “Licitações” automaticamente
            </span>
            <span className="mt-1 block text-[13px] text-muted-foreground">
              Quando ligado, o site reúne os itens de Matérias (Atividades Legislativas, Atas,
              Pautas, Publicações Oficiais) em um único menu suspenso “Matérias” e posiciona
              “Licitações” logo antes de “Transparência”. Isso mantém o padrão institucional, mas
              pode reposicionar itens que você arrastou aqui.{' '}
              <strong className="text-foreground">Desligue</strong> para que o site respeite
              exatamente a ordem que você definir abaixo.
            </span>
          </span>
        </label>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndHeader}>
          <SortableContext
            items={data.header_menu.map((it) => it._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {data.header_menu.map((item, i) => (
                <SortableRow key={item._id} id={item._id}>
                  {(handle) => (
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center gap-2">
                        {handle}
                        <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
                          <Input
                            value={item.label}
                            onChange={(e) => setItem(i, { label: e.target.value })}
                            placeholder="Nome do item (ex.: Transparência)"
                            className="sm:flex-1"
                          />
                          <Input
                            value={item.href}
                            onChange={(e) => setItem(i, { href: e.target.value })}
                            placeholder="/transparencia"
                            title={urlHint}
                            className="sm:flex-1"
                          />
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <IconButton
                            tone="success"
                            title="Adicionar subitem (dropdown)"
                            onClick={() =>
                              setItem(i, {
                                children: [
                                  ...(item.children ?? []),
                                  { _id: nextId(), label: '', href: '/' },
                                ],
                              })
                            }
                          >
                            <CornerDownRight className="w-4 h-4" />
                          </IconButton>
                          <IconButton
                            tone="delete"
                            title="Remover item"
                            onClick={() =>
                              setData(
                                'header_menu',
                                data.header_menu.filter((_, idx) => idx !== i)
                              )
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </div>

                      {(item.children ?? []).length > 0 && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-navy/20 space-y-2">
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => onDragEndChildren(i, e)}
                          >
                            <SortableContext
                              items={(item.children ?? []).map((c) => c._id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {(item.children ?? []).map((child, ci) => (
                                <SortableRow key={child._id} id={child._id}>
                                  {(childHandle) => (
                                    <div className="flex items-center gap-2">
                                      {childHandle}
                                      <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
                                        <Input
                                          value={child.label}
                                          onChange={(e) =>
                                            setChild(i, ci, { label: e.target.value })
                                          }
                                          placeholder="Nome do subitem"
                                          className="sm:flex-1"
                                        />
                                        <Input
                                          value={child.href}
                                          onChange={(e) =>
                                            setChild(i, ci, { href: e.target.value })
                                          }
                                          placeholder="/pagina"
                                          title={urlHint}
                                          className="sm:flex-1"
                                        />
                                      </div>
                                      <IconButton
                                        tone="delete"
                                        title="Remover subitem"
                                        onClick={() =>
                                          setItem(i, {
                                            children: (item.children ?? []).filter(
                                              (_, idx) => idx !== ci
                                            ),
                                          })
                                        }
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </IconButton>
                                    </div>
                                  )}
                                </SortableRow>
                              ))}
                            </SortableContext>
                          </DndContext>
                        </div>
                      )}
                    </div>
                  )}
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>

      {/* ===================== Rodapé ===================== */}
      <Card>
        <CardHeader
          icon={Link2}
          title="Colunas de links do rodapé"
          description="As colunas aparecem entre a logo e o bloco de contato. Arraste os links pela alça para reordenar."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setData('footer_columns', [
                  ...data.footer_columns,
                  { _id: nextId(), title: 'Nova coluna', links: [] },
                ])
              }
            >
              <Plus className="w-4 h-4" />
              Adicionar coluna
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.footer_columns.map((col, i) => (
            <div key={col._id} className="border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={col.title}
                  onChange={(e) => setColumn(i, { title: e.target.value })}
                  placeholder="Título da coluna"
                  className="font-semibold"
                />
                <IconButton
                  tone="success"
                  title="Adicionar link"
                  onClick={() =>
                    setColumn(i, {
                      links: [...col.links, { _id: nextId(), label: '', href: '/' }],
                    })
                  }
                >
                  <Plus className="w-4 h-4" />
                </IconButton>
                <IconButton
                  tone="delete"
                  title="Remover coluna"
                  onClick={() =>
                    setData(
                      'footer_columns',
                      data.footer_columns.filter((_, idx) => idx !== i)
                    )
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>

              <div className="space-y-2">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => onDragEndLinks(i, e)}
                >
                  <SortableContext
                    items={col.links.map((l) => l._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {col.links.map((link, li) => (
                      <SortableRow key={link._id} id={link._id}>
                        {(linkHandle) => (
                          <div className="flex items-center gap-2">
                            {linkHandle}
                            <div className="flex gap-2 flex-1 min-w-0">
                              <Input
                                value={link.label}
                                onChange={(e) =>
                                  setColumn(i, {
                                    links: col.links.map((l, idx) =>
                                      idx === li ? { ...l, label: e.target.value } : l
                                    ),
                                  })
                                }
                                placeholder="Nome do link"
                              />
                              <Input
                                value={link.href}
                                onChange={(e) =>
                                  setColumn(i, {
                                    links: col.links.map((l, idx) =>
                                      idx === li ? { ...l, href: e.target.value } : l
                                    ),
                                  })
                                }
                                placeholder="/pagina"
                                title={urlHint}
                              />
                            </div>
                            <IconButton
                              tone="delete"
                              title="Remover link"
                              onClick={() =>
                                setColumn(i, {
                                  links: col.links.filter((_, idx) => idx !== li),
                                })
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </IconButton>
                          </div>
                        )}
                      </SortableRow>
                    ))}
                  </SortableContext>
                </DndContext>
                {col.links.length === 0 && (
                  <p className="text-xs text-muted-foreground py-2">
                    Nenhum link nesta coluna ainda.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-border">
          <Button onClick={submit} loading={processing}>
            Salvar alterações
          </Button>
        </div>
      </Card>
    </AdminLayout>
  )
}
