import { Head, useForm, router } from '@inertiajs/react'
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
  ArrowDown,
  ArrowUp,
  CornerDownRight,
  Link2,
  Menu as MenuIcon,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'

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
}

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr
  const copy = [...arr]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

export default function MenusIndex({ headerMenu, footerColumns }: Props) {
  const { data, setData, post, processing } = useForm<{
    header_menu: MenuItem[]
    footer_columns: FooterColumn[]
  }>({
    header_menu: headerMenu,
    footer_columns: footerColumns,
  })

  /* ---------- header menu helpers ---------- */
  const setItem = (i: number, patch: Partial<MenuItem>) =>
    setData(
      'header_menu',
      data.header_menu.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    )

  const setChild = (i: number, ci: number, patch: Partial<MenuChild>) =>
    setItem(i, {
      children: (data.header_menu[i].children ?? []).map((c, idx) =>
        idx === ci ? { ...c, ...patch } : c
      ),
    })

  /* ---------- footer helpers ---------- */
  const setColumn = (i: number, patch: Partial<FooterColumn>) =>
    setData(
      'footer_columns',
      data.footer_columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c))
    )

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
          description="Itens com subitens viram dropdown. A ordem aqui é a ordem no site."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setData('header_menu', [...data.header_menu, { label: '', href: '/' }])
              }
            >
              <Plus className="w-4 h-4" />
              Adicionar item
            </Button>
          }
        />

        <div className="space-y-3">
          {data.header_menu.map((item, i) => (
            <div key={i} className="border border-border rounded-lg p-4 bg-muted/30">
              <div className="flex flex-col sm:flex-row gap-2">
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
                <div className="flex items-center gap-0.5 shrink-0">
                  <IconButton
                    tone="neutral"
                    title="Mover para cima"
                    onClick={() => setData('header_menu', move(data.header_menu, i, i - 1))}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    tone="neutral"
                    title="Mover para baixo"
                    onClick={() => setData('header_menu', move(data.header_menu, i, i + 1))}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </IconButton>
                  <IconButton
                    tone="success"
                    title="Adicionar subitem (dropdown)"
                    onClick={() =>
                      setItem(i, { children: [...(item.children ?? []), { label: '', href: '/' }] })
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
                  {(item.children ?? []).map((child, ci) => (
                    <div key={ci} className="flex flex-col sm:flex-row gap-2">
                      <Input
                        value={child.label}
                        onChange={(e) => setChild(i, ci, { label: e.target.value })}
                        placeholder="Nome do subitem"
                        className="sm:flex-1"
                      />
                      <Input
                        value={child.href}
                        onChange={(e) => setChild(i, ci, { href: e.target.value })}
                        placeholder="/pagina"
                        title={urlHint}
                        className="sm:flex-1"
                      />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <IconButton
                          tone="neutral"
                          title="Mover para cima"
                          onClick={() =>
                            setItem(i, { children: move(item.children ?? [], ci, ci - 1) })
                          }
                        >
                          <ArrowUp className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          tone="neutral"
                          title="Mover para baixo"
                          onClick={() =>
                            setItem(i, { children: move(item.children ?? [], ci, ci + 1) })
                          }
                        >
                          <ArrowDown className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          tone="delete"
                          title="Remover subitem"
                          onClick={() =>
                            setItem(i, {
                              children: (item.children ?? []).filter((_, idx) => idx !== ci),
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ===================== Rodapé ===================== */}
      <Card>
        <CardHeader
          icon={Link2}
          title="Colunas de links do rodapé"
          description="As colunas aparecem entre a logo e o bloco de contato."
          actions={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setData('footer_columns', [
                  ...data.footer_columns,
                  { title: 'Nova coluna', links: [] },
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
            <div key={i} className="border border-border rounded-lg p-4 bg-muted/30">
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
                    setColumn(i, { links: [...col.links, { label: '', href: '/' }] })
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
                {col.links.map((link, li) => (
                  <div key={li} className="flex gap-2">
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
                    <div className="flex items-center gap-0.5 shrink-0">
                      <IconButton
                        tone="neutral"
                        title="Mover para cima"
                        onClick={() => setColumn(i, { links: move(col.links, li, li - 1) })}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        tone="delete"
                        title="Remover link"
                        onClick={() =>
                          setColumn(i, { links: col.links.filter((_, idx) => idx !== li) })
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                ))}
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
