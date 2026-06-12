/**
 * UI kit do painel administrativo.
 * Todos os módulos do /painel devem usar estes componentes — nada de
 * reimplementar tabela/input/badge com cores soltas (gray-*, blue-*, etc.).
 * A paleta vem dos tokens do design system (navy/gold/border/muted/card).
 */
import { Link, router } from '@inertiajs/react'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  type LucideIcon,
} from 'lucide-react'
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
  forwardRef,
  useState,
} from 'react'

/* ============================== Botões ============================== */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'gold'
type ButtonSize = 'sm' | 'md'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-dark shadow-sm',
  secondary: 'bg-card text-foreground border border-border hover:bg-muted',
  ghost: 'text-muted-foreground hover:text-navy hover:bg-navy/5',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
  gold: 'bg-gold text-navy-dark hover:bg-gold-light shadow-sm',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

interface ButtonLinkProps {
  href: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
  target?: string
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  target,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors no-underline whitespace-nowrap ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
    >
      {children}
    </Link>
  )
}

/** Botão "Novo X" padrão das listagens */
export function CreateButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <ButtonLink href={href}>
      <Plus className="w-4 h-4" />
      {children}
    </ButtonLink>
  )
}

/**
 * Botão de ícone para ações de linha (editar/excluir/ver).
 * Semântica fixa: edit=navy, delete=destructive, view=sky/info, neutral=muted.
 */
type IconButtonTone = 'edit' | 'delete' | 'view' | 'neutral' | 'success'

const iconTones: Record<IconButtonTone, string> = {
  edit: 'text-muted-foreground hover:text-navy hover:bg-navy/10',
  delete: 'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
  view: 'text-muted-foreground hover:text-sky hover:bg-sky/10',
  success: 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-600/10',
  neutral: 'text-muted-foreground hover:text-foreground hover:bg-muted',
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: IconButtonTone
}

export function IconButton({ tone = 'neutral', className = '', ...props }: IconButtonProps) {
  return (
    <button
      className={`p-2 rounded-lg transition-colors ${iconTones[tone]} ${className}`}
      {...props}
    />
  )
}

export function IconLink({
  href,
  tone = 'neutral',
  className = '',
  title,
  target,
  children,
}: {
  href: string
  tone?: IconButtonTone
  className?: string
  title?: string
  target?: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      title={title}
      target={target}
      className={`p-2 rounded-lg transition-colors inline-flex ${iconTones[tone]} ${className}`}
    >
      {children}
    </Link>
  )
}

/* ============================== Forms ============================== */

const inputBase =
  'w-full bg-card border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-shadow focus:ring-2 focus:ring-navy/25 focus:border-navy disabled:opacity-60 disabled:bg-muted'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...props }, ref) {
    return <input ref={ref} className={`${inputBase} ${className}`} {...props} />
  }
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = '', ...props }, ref) {
  return <textarea ref={ref} className={`${inputBase} min-h-[100px] ${className}`} {...props} />
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', ...props }, ref) {
    return <select ref={ref} className={`${inputBase} pr-8 ${className}`} {...props} />
  }
)

/** Label + campo + erro + dica, com marcação consistente de obrigatório */
export function Field({
  label,
  required,
  error,
  hint,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-[13px] font-semibold text-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

/** Busca com ícone — Enter dispara onSearch */
export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
        placeholder={placeholder}
        className={`${inputBase} pl-10`}
      />
    </div>
  )
}

/* ============================== Card / PageHeader ============================== */

export function Card({
  children,
  className = '',
  padding = true,
}: {
  children: ReactNode
  className?: string
  padding?: boolean
}) {
  return (
    <div
      className={`bg-card rounded-xl border border-border shadow-sm ${padding ? 'p-5 lg:p-6' : 'overflow-hidden'} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px]" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-foreground leading-tight">{title}</h2>
          {description && <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {actions}
    </div>
  )
}

/** Cabeçalho de página: título + descrição à esquerda, ações à direita */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

/** Barra de filtros acima das tabelas */
export function Toolbar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-5 [&>*]:w-full sm:[&>*]:w-auto ${className}`}
    >
      {children}
    </div>
  )
}

/* ============================== Tabela ============================== */

export function Table({
  children,
  className = '',
  footer,
}: {
  children: ReactNode
  className?: string
  /** Geralmente <Pagination />, renderizada dentro do mesmo card */
  footer?: ReactNode
}) {
  return (
    <div className={`bg-card rounded-xl border border-border shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
      {footer}
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="bg-muted/60 border-b border-border">{children}</tr>
    </thead>
  )
}

export function TH({ className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`text-left px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${className}`}
      {...props}
    />
  )
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border/70">{children}</tbody>
}

export function TR({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <tr className={`hover:bg-muted/40 transition-colors ${className}`}>{children}</tr>
}

export function TD({ className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-5 py-3.5 text-sm text-foreground ${className}`} {...props} />
}

/** Célula de ações alinhada à direita */
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-0.5">{children}</div>
}

/** Linha de "nenhum resultado" dentro da tabela */
export function TableEmpty({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-14 text-center text-sm text-muted-foreground">
        {children}
      </td>
    </tr>
  )
}

/* ============================== Badges de status ============================== */

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'navy' | 'gold'

const badgeTones: Record<BadgeTone, string> = {
  success: 'bg-emerald-600/10 text-emerald-700',
  warning: 'bg-amber-500/10 text-amber-700',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-sky/10 text-sky',
  neutral: 'bg-muted text-muted-foreground',
  navy: 'bg-navy/10 text-navy',
  gold: 'bg-gold/15 text-amber-700',
}

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/**
 * Mapa ÚNICO de status do domínio → tom visual.
 * Todo CRUD usa StatusBadge em vez de inventar cores.
 */
const STATUS_MAP: Record<string, { label: string; tone: BadgeTone }> = {
  // Conteúdo
  published: { label: 'Publicada', tone: 'success' },
  draft: { label: 'Rascunho', tone: 'warning' },
  archived: { label: 'Arquivada', tone: 'neutral' },
  // Genéricos
  active: { label: 'Ativo', tone: 'success' },
  inactive: { label: 'Inativo', tone: 'neutral' },
  pending: { label: 'Pendente', tone: 'warning' },
  // Licitações
  aberta: { label: 'Aberta', tone: 'success' },
  em_andamento: { label: 'Em andamento', tone: 'info' },
  encerrada: { label: 'Encerrada', tone: 'neutral' },
  homologada: { label: 'Homologada', tone: 'navy' },
  cancelada: { label: 'Cancelada', tone: 'danger' },
  revogada: { label: 'Revogada', tone: 'danger' },
  deserta: { label: 'Deserta', tone: 'warning' },
  fracassada: { label: 'Fracassada', tone: 'danger' },
  suspensa: { label: 'Suspensa', tone: 'warning' },
  // Votações / matérias
  aprovado: { label: 'Aprovado', tone: 'success' },
  aprovada: { label: 'Aprovada', tone: 'success' },
  rejeitado: { label: 'Rejeitado', tone: 'danger' },
  rejeitada: { label: 'Rejeitada', tone: 'danger' },
  em_tramitacao: { label: 'Em tramitação', tone: 'info' },
  retirado: { label: 'Retirado', tone: 'neutral' },
  sim: { label: 'Sim', tone: 'success' },
  nao: { label: 'Não', tone: 'danger' },
  abstencao: { label: 'Abstenção', tone: 'warning' },
  ausente: { label: 'Ausente', tone: 'neutral' },
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const key = status?.toLowerCase?.() ?? ''
  const entry = STATUS_MAP[key]
  return <Badge tone={entry?.tone ?? 'neutral'}>{label ?? entry?.label ?? status}</Badge>
}

/* ============================== Paginação ============================== */

interface PaginationMeta {
  total: number
  per_page?: number
  current_page: number
  last_page: number
}

export function Pagination({
  meta,
  baseUrl,
  itemLabel = 'registro',
  itemLabelPlural,
}: {
  meta: PaginationMeta
  baseUrl: string
  itemLabel?: string
  itemLabelPlural?: string
}) {
  if (meta.last_page <= 1) return null
  const plural = itemLabelPlural ?? `${itemLabel}s`
  const sep = baseUrl.includes('?') ? '&' : '?'
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border">
      <span className="text-[13px] text-muted-foreground">
        {meta.total} {meta.total === 1 ? itemLabel : plural} • Página {meta.current_page} de{' '}
        {meta.last_page}
      </span>
      <div className="flex items-center gap-1">
        <Link
          href={`${baseUrl}${sep}page=${meta.current_page - 1}`}
          preserveState
          className={`p-2 rounded-lg transition-colors ${
            meta.current_page > 1
              ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
              : 'text-border pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <Link
          href={`${baseUrl}${sep}page=${meta.current_page + 1}`}
          preserveState
          className={`p-2 rounded-lg transition-colors ${
            meta.current_page < meta.last_page
              ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
              : 'text-border pointer-events-none'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

/* ============================== Empty state ============================== */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="bg-card rounded-xl border border-dashed border-border py-16 px-6 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-[13px] text-muted-foreground mb-4">{description}</p>}
      {action}
    </div>
  )
}

/* ============================== Modal / ConfirmDialog ============================== */

export function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-md',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  maxWidth?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-card rounded-xl shadow-lg w-full ${maxWidth} animate-scale-in border border-border`}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Diálogo padrão de exclusão. Uso:
 *   const [target, setTarget] = useState<{ id: number; label: string } | null>(null)
 *   <ConfirmDelete target={target} onClose={() => setTarget(null)} deleteUrl={(id) => `/painel/x/${id}`} entity="notícia" />
 */
export function ConfirmDelete({
  target,
  onClose,
  deleteUrl,
  entity = 'registro',
}: {
  target: { id: number | string; label: string } | null
  onClose: () => void
  deleteUrl: (id: number | string) => string
  entity?: string
}) {
  const [deleting, setDeleting] = useState(false)

  function confirm() {
    if (!target) return
    setDeleting(true)
    router.delete(deleteUrl(target.id), {
      preserveScroll: true,
      onFinish: () => {
        setDeleting(false)
        onClose()
      },
    })
  }

  return (
    <Modal open={target !== null} onClose={onClose}>
      <div className="p-6">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-foreground text-center mb-2">
          Excluir {entity}
        </h3>
        <p className="text-muted-foreground text-center text-sm">
          Tem certeza que deseja excluir &ldquo;{target?.label}&rdquo;? Esta ação não pode ser
          desfeita.
        </p>
      </div>
      <div className="flex gap-3 p-4 bg-muted/50 rounded-b-xl border-t border-border">
        <Button variant="secondary" className="flex-1" onClick={onClose} disabled={deleting}>
          Cancelar
        </Button>
        <Button variant="destructive" className="flex-1" onClick={confirm} loading={deleting}>
          {deleting ? 'Excluindo...' : 'Excluir'}
        </Button>
      </div>
    </Modal>
  )
}

/* ============================== Stat card (dashboard) ============================== */

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
}: {
  label: string
  value: ReactNode
  icon: LucideIcon
  hint?: string
  href?: string
}) {
  const body = (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 flex items-start justify-between gap-3 transition-all hover:shadow-md hover:border-navy/25 h-full">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
      </div>
      <div className="w-10 h-10 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
  return href ? (
    <Link href={href} className="no-underline block h-full">
      {body}
    </Link>
  ) : (
    body
  )
}
