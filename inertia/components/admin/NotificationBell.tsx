import { useEffect, useRef, useState } from 'react'
import { Link } from '@inertiajs/react'
import { Bell, LogIn, Shield, HardDrive, Activity, FileText, Send, Check, X, Clock } from 'lucide-react'

interface NotificationItem {
  id: number
  type: 'login' | 'firewall' | 'backup' | 'health' | 'report' | 'test'
  status: 'pending' | 'success' | 'failed' | 'skipped'
  message: string | null
  createdAt: string | null
}

// Tipo de alerta → rótulo + ícone (os alertas saem por WhatsApp/Evolution).
const TYPE_META: Record<NotificationItem['type'], { label: string; Icon: typeof Bell }> = {
  login: { label: 'Acesso ao painel', Icon: LogIn },
  firewall: { label: 'Segurança / firewall', Icon: Shield },
  backup: { label: 'Backup', Icon: HardDrive },
  health: { label: 'Saúde do sistema', Icon: Activity },
  report: { label: 'Relatório', Icon: FileText },
  test: { label: 'Teste', Icon: Send },
}

const STATUS_META: Record<NotificationItem['status'], { label: string; cls: string; Icon: typeof Check }> = {
  success: { label: 'enviado', cls: 'text-emerald-600 dark:text-emerald-400', Icon: Check },
  failed: { label: 'falhou', cls: 'text-red-600 dark:text-red-400', Icon: X },
  pending: { label: 'pendente', cls: 'text-amber-600 dark:text-amber-400', Icon: Clock },
  skipped: { label: 'ignorado', cls: 'text-muted-foreground', Icon: Clock },
}

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  if (Number.isNaN(d)) return ''
  const diff = Math.max(0, Date.now() - d)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} h`
  const dias = Math.floor(h / 24)
  return `${dias} d`
}

const LAST_SEEN_KEY = 'admin_notif_last_seen'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [lastSeen, setLastSeen] = useState<number>(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      setLastSeen(Number(window.localStorage.getItem(LAST_SEEN_KEY) || '0'))
    } catch {
      /* ignore */
    }
    fetch('/painel/notificacoes/recentes', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems(Array.isArray(d.items) ? d.items : []))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const unread = items.filter((n) => n.id > lastSeen).length

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && items.length) {
      const max = Math.max(...items.map((n) => n.id))
      setLastSeen(max)
      try {
        window.localStorage.setItem(LAST_SEEN_KEY, String(max))
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className="relative p-2.5 min-h-[2.75rem] min-w-[2.75rem] rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        aria-label="Notificações"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[1rem] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-4 text-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notificações</span>
            <Link
              href="/painel/seguranca"
              className="text-xs font-medium text-navy hover:underline no-underline"
              onClick={() => setOpen(false)}
            >
              Ver tudo
            </Link>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {!loaded && <div className="px-4 py-6 text-center text-sm text-muted-foreground">Carregando…</div>}
            {loaded && items.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhuma notificação ainda.
                <span className="mt-1 block text-xs text-muted-foreground/70">
                  Aqui aparecem alertas de acesso, segurança, backup e saúde do sistema.
                </span>
              </div>
            )}
            {loaded &&
              items.map((n) => {
                const meta = TYPE_META[n.type] ?? TYPE_META.test
                const st = STATUS_META[n.status] ?? STATUS_META.pending
                const Icon = meta.Icon
                const StIcon = st.Icon
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/60 last:border-0 ${
                      n.id > lastSeen ? 'bg-navy/5' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground truncate">{meta.label}</span>
                        <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      {n.message && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                      )}
                      <span className={`mt-1 inline-flex items-center gap-1 text-[11px] font-medium ${st.cls}`}>
                        <StIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
