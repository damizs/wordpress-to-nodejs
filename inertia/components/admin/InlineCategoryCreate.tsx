/**
 * Criação de categoria INLINE, sem sair do formulário.
 *
 * Usa os endpoints EXISTENTES do painel:
 *  - POST /painel/categorias        → cria (system_categories_controller@store)
 *  - GET  /api/categorias/:type     → recarrega a lista em JSON (@byType)
 *
 * Só funciona para tipos geridos por `SystemCategory` (ex.: 'faq', 'publication',
 * 'session_type'). NÃO use para categorias de notícias (tabela `news_categories`,
 * sem endpoint de escrita).
 *
 * Após criar, devolve via `onCreated` a lista atualizada e a categoria nova para
 * o formulário pai já selecioná-la.
 */
import { useState } from 'react'
import { FolderPlus, Plus, Save } from 'lucide-react'
import { Button, Field, Input, Modal } from '~/components/admin/ui'
import { getCsrfToken } from '~/lib/media_upload'

export interface SimpleCategory {
  id: number
  name: string
  slug: string
  [key: string]: any
}

interface Props {
  /** Tipo da SystemCategory (ex.: 'faq'). */
  type: string
  /** Recebe a lista recarregada e a categoria recém-criada (se identificada). */
  onCreated: (categories: SimpleCategory[], created: SimpleCategory | null) => void
  buttonLabel?: string
}

export default function InlineCategoryCreate({
  type,
  onCreated,
  buttonLabel = 'Nova categoria',
}: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function close() {
    if (saving) return
    setOpen(false)
    setName('')
    setError(null)
  }

  async function submit() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Informe o nome da categoria.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const token = getCsrfToken()
      const fd = new FormData()
      fd.append('type', type)
      fd.append('name', trimmed)
      fd.append('is_active', 'true')

      const res = await fetch('/painel/categorias', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': token, 'X-XSRF-TOKEN': token },
        body: fd,
        credentials: 'same-origin',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      // Recarrega a lista (JSON) já contendo a nova categoria.
      const listRes = await fetch(`/api/categorias/${encodeURIComponent(type)}`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
      const list: SimpleCategory[] = listRes.ok ? await listRes.json() : []
      const created =
        list.find((c) => c.name === trimmed) || (list.length ? list[list.length - 1] : null)

      onCreated(list, created)
      setName('')
      setOpen(false)
    } catch {
      setError('Não foi possível criar a categoria. Tente novamente ou use a tela de Categorias.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" /> {buttonLabel}
      </Button>

      <Modal open={open} onClose={close}>
        {/* <div>, não <form>, para não aninhar formulários dentro do form pai. */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Nova categoria</h3>
              <p className="text-sm text-muted-foreground">Crie sem sair deste formulário.</p>
            </div>
          </div>

          <Field label="Nome da categoria" required error={error ?? undefined}>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder="Ex: Comunicados"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={close} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" onClick={submit} loading={saving}>
              {!saving && <Save className="w-4 h-4" />}
              {saving ? 'Criando...' : 'Criar categoria'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
