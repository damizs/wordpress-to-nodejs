/**
 * UI kit do painel administrativo.
 * Todos os módulos do /painel devem usar estes componentes — nada de
 * reimplementar tabela/input/badge com cores soltas (gray-*, blue-*, etc.).
 * A paleta vem dos tokens do design system (navy/gold/border/muted/card).
 */
import { Link, router } from '@inertiajs/react'
import { useFocusTrap } from '~/hooks/useFocusTrap'
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
  type ReactElement,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
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
      className={`inline-flex items-center justify-center min-h-[2.75rem] min-w-[2.75rem] p-2 rounded-lg transition-colors ${iconTones[tone]} ${className}`}
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
      className={`inline-flex items-center justify-center min-h-[2.75rem] min-w-[2.75rem] p-2 rounded-lg transition-colors ${iconTones[tone]} ${className}`}
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
  const autoId = useId()
  const childProps = (isValidElement(children) ? (children.props as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >
  const fieldId = (childProps.id as string) || `field-${autoId}`
  const hintId = `${fieldId}-hint`
  const errorId = `${fieldId}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  // Associa o controle ao label/dica/erro sem exigir mudança em cada formulário.
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: fieldId,
        'aria-describedby':
          [childProps['aria-describedby'] as string | undefined, describedBy].filter(Boolean).join(' ') ||
          undefined,
        'aria-invalid': error ? true : (childProps['aria-invalid'] as boolean | undefined),
      })
    : children

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="block text-[13px] font-semibold text-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Resumo de erros de validação (role="alert"). Lê os erros e, se houver, mostra
 * uma caixa no topo do conteúdo. Use a versão global no AdminLayout (cobre todos
 * os forms via props.errors do Inertia) ou passe `errors` manualmente num form.
 */
export function ErrorSummary({ errors, className = '' }: { errors?: Record<string, string>; className?: string }) {
  const items = Object.entries(errors || {}).filter(([, v]) => Boolean(v))
  if (items.length === 0) return null
  return (
    <div
      role="alert"
      className={`rounded-lg border border-l-4 border-l-destructive bg-destructive/5 p-4 text-sm ${className}`}
    >
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
        {items.length === 1 ? 'Corrija o campo abaixo:' : 'Corrija os campos abaixo:'}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-9 text-muted-foreground">
        {items.map(([key, value]) => (
          <li key={key}>{value}</li>
        ))}
      </ul>
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

/** Container fluido padrão do painel — usa 100% da área útil (sem max-width). */
export function AdminPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`w-full min-w-0 ${className}`}>{children}</div>
}

export function Card({
  children,
  className = '',
  padding = true,
  hover = false,
}: {
  children: ReactNode
  className?: string
  padding?: boolean
  /** Realce sutil ao passar o mouse (sombra + borda navy). Opcional. */
  hover?: boolean
}) {
  return (
    <div
      className={`bg-card rounded-xl border border-border shadow-sm ${
        hover ? 'transition-all hover:shadow-md hover:border-navy/20' : ''
      } ${padding ? 'p-5 lg:p-6' : 'overflow-hidden'} ${className}`}
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

/**
 * Cabeçalho de página: título + descrição à esquerda, ações à direita.
 * - `eyebrow`: rótulo pequeno em maiúsculas acima do título.
 * - `icon`: ícone num "chip" à esquerda do título.
 * - `variant='hero'`: faixa com gradiente (estilo do hero do dashboard),
 *   texto branco e ações legíveis sobre o gradiente; empilha no mobile.
 */
export function PageHeader({
  title,
  description,
  actions,
  icon: Icon,
  eyebrow,
  variant = 'default',
}: {
  title: string
  description?: string
  actions?: ReactNode
  icon?: LucideIcon
  eyebrow?: string
  variant?: 'default' | 'hero'
}) {
  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden bg-gradient-hero text-white rounded-2xl px-6 py-6 lg:px-8 shadow-md mb-6">
        <div
          className="absolute -top-16 -right-16 w-56 h-56 bg-gold/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            {Icon && (
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-2xl font-bold tracking-tight leading-tight">{title}</h1>
              {description && <p className="text-sm text-white/80 mt-1">{description}</p>}
            </div>
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0 sm:justify-end">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {eyebrow}
            </p>
          )}
          <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0 sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  )
}

/* ============================== Layout de formulário ============================== */

/**
 * Grade reutilizável para distribuir campos preenchendo a largura.
 * `cols` 1 | 2 | 3 (padrão 2). Sempre 1 coluna no mobile.
 */
export function FormGrid({
  children,
  cols = 2,
  className = '',
}: {
  children: ReactNode
  cols?: 1 | 2 | 3
  className?: string
}) {
  const colsClass =
    cols === 1 ? '' : cols === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'
  return <div className={`grid gap-5 ${colsClass} ${className}`.trim()}>{children}</div>
}

/**
 * Seção de formulário em Card que OCUPA a largura toda no desktop —
 * substitui o antigo `max-w-xl mx-auto` estreito. Header opcional (título +
 * descrição + ícone/ações) e um grid responsivo para os campos.
 * `columns===2` → 2 colunas a partir de md.
 */
export function FormSection({
  title,
  description,
  children,
  columns = 1,
  icon,
  actions,
  className = '',
}: {
  title?: string
  description?: string
  children: ReactNode
  columns?: 1 | 2
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader title={title} description={description} icon={icon} actions={actions} />
      )}
      <div className={`grid gap-5 ${columns === 2 ? 'md:grid-cols-2' : ''}`.trim()}>{children}</div>
    </Card>
  )
}

/* ============================== Avatar ============================== */

const avatarSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
}

function avatarInitials(name?: string) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

/**
 * Avatar apresentacional: mostra a imagem se `src` existir, senão as iniciais
 * de `name` num círculo navy. Tokens, dark-safe. `size` sm | md | lg.
 */
export function Avatar({
  src,
  name,
  size = 'md',
  className = '',
}: {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClass = avatarSizes[size]
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ''}
        className={`${sizeClass} rounded-full object-cover bg-muted shrink-0 ${className}`}
      />
    )
  }
  return (
    <span
      title={name || undefined}
      aria-hidden={name ? undefined : true}
      className={`${sizeClass} rounded-full bg-navy text-white font-semibold inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {avatarInitials(name)}
    </span>
  )
}

/** Barra de filtros acima das tabelas */
export function Toolbar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-5 [&>*]:w-full sm:[&>*]:w-auto sm:[&>*]:min-w-0 ${className}`}
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
  scrollLabel = 'Tabela — role horizontalmente para ver todas as colunas',
}: {
  children: ReactNode
  className?: string
  /** Geralmente <Pagination />, renderizada dentro do mesmo card */
  footer?: ReactNode
  /** Rótulo acessível da região de scroll horizontal */
  scrollLabel?: string
}) {
  return (
    <div
      className={`w-full min-w-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden ${className}`}
    >
      <div
        role="region"
        aria-label={scrollLabel}
        tabIndex={0}
        className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <table className="w-full min-w-[640px] border-collapse">{children}</table>
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
      className={`text-left px-3 sm:px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${className}`}
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
  return <td className={`px-3 sm:px-5 py-3.5 text-sm text-foreground ${className}`} {...props} />
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
  success: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-sky/10 text-sky',
  neutral: 'bg-muted text-muted-foreground',
  navy: 'bg-navy/10 text-navy dark:text-navy-light',
  gold: 'bg-gold/15 text-amber-700 dark:text-amber-300',
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
  tramitando: { label: 'Em tramitação', tone: 'info' },
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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-3 border-t border-border">
      <span className="text-[13px] text-muted-foreground text-center sm:text-left">
        {meta.total} {meta.total === 1 ? itemLabel : plural} • Página {meta.current_page} de{' '}
        {meta.last_page}
      </span>
      <div className="flex items-center justify-center sm:justify-end gap-1">
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
  const ref = useFocusTrap(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={`relative bg-card rounded-t-2xl sm:rounded-xl shadow-lg w-full ${maxWidth} max-h-[min(92dvh,calc(100vh-1rem))] sm:max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto animate-scale-in border border-border`}
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
