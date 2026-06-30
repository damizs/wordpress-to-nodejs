/**
 * Seletor visual de ícone (lucide-react) para o painel.
 *
 * Em vez de o usuário digitar o nome técnico de um ícone (ex.: "FileText"),
 * ele busca e clica numa grade visual. O componente continua devolvendo o
 * NOME do ícone (string) via `onChange`, então é compatível com os campos
 * que hoje salvam o nome lucide como texto.
 *
 * Acessível (combobox + listbox, teclado/Escape, foco no campo de busca) e
 * dark-safe (tokens do design system).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  Award,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Coins,
  Database,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileSignature,
  FileText,
  FolderOpen,
  Gavel,
  Globe,
  GraduationCap,
  Handshake,
  HardHat,
  HeartPulse,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Info,
  Landmark,
  Link as LinkIcon,
  Mail,
  MailOpen,
  Map as MapIcon,
  MapPin,
  Megaphone,
  MessageCircle,
  Network,
  Newspaper,
  PieChart,
  Phone,
  Pill,
  Plane,
  Play,
  Scale,
  ScrollText,
  Search,
  Settings,
  Shield,
  Star,
  Table as TableIcon,
  TrendingDown,
  TrendingUp,
  Users,
  UserCheck,
  Video,
  Vote,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'

/**
 * Conjunto curado de ícones comuns a um portal de câmara municipal. Os nomes
 * cobrem os mapas usados nas seções públicas (transparência, acesso rápido),
 * então a maioria das escolhas é renderizada corretamente no site.
 */
export const ICON_OPTIONS: { name: string; Icon: LucideIcon }[] = [
  { name: 'Shield', Icon: Shield },
  { name: 'FileText', Icon: FileText },
  { name: 'FileCheck', Icon: FileCheck },
  { name: 'FileSignature', Icon: FileSignature },
  { name: 'Scale', Icon: Scale },
  { name: 'Gavel', Icon: Gavel },
  { name: 'Landmark', Icon: Landmark },
  { name: 'Building', Icon: Building },
  { name: 'Building2', Icon: Building2 },
  { name: 'Users', Icon: Users },
  { name: 'UserCheck', Icon: UserCheck },
  { name: 'BookOpen', Icon: BookOpen },
  { name: 'ScrollText', Icon: ScrollText },
  { name: 'Newspaper', Icon: Newspaper },
  { name: 'Phone', Icon: Phone },
  { name: 'Mail', Icon: Mail },
  { name: 'MailOpen', Icon: MailOpen },
  { name: 'MapPin', Icon: MapPin },
  { name: 'Map', Icon: MapIcon },
  { name: 'Home', Icon: Home },
  { name: 'Calendar', Icon: Calendar },
  { name: 'Clock', Icon: Clock },
  { name: 'DollarSign', Icon: DollarSign },
  { name: 'Coins', Icon: Coins },
  { name: 'Wallet', Icon: Wallet },
  { name: 'Search', Icon: Search },
  { name: 'Link', Icon: LinkIcon },
  { name: 'ExternalLink', Icon: ExternalLink },
  { name: 'Globe', Icon: Globe },
  { name: 'Download', Icon: Download },
  { name: 'TrendingUp', Icon: TrendingUp },
  { name: 'TrendingDown', Icon: TrendingDown },
  { name: 'BarChart3', Icon: BarChart3 },
  { name: 'PieChart', Icon: PieChart },
  { name: 'Network', Icon: Network },
  { name: 'Database', Icon: Database },
  { name: 'FolderOpen', Icon: FolderOpen },
  { name: 'Table', Icon: TableIcon },
  { name: 'ClipboardList', Icon: ClipboardList },
  { name: 'ClipboardCheck', Icon: ClipboardCheck },
  { name: 'Handshake', Icon: Handshake },
  { name: 'BadgeCheck', Icon: BadgeCheck },
  { name: 'Award', Icon: Award },
  { name: 'GraduationCap', Icon: GraduationCap },
  { name: 'HardHat', Icon: HardHat },
  { name: 'HeartPulse', Icon: HeartPulse },
  { name: 'Pill', Icon: Pill },
  { name: 'Plane', Icon: Plane },
  { name: 'Car', Icon: Car },
  { name: 'Eye', Icon: Eye },
  { name: 'Play', Icon: Play },
  { name: 'Video', Icon: Video },
  { name: 'MessageCircle', Icon: MessageCircle },
  { name: 'Megaphone', Icon: Megaphone },
  { name: 'Bell', Icon: Bell },
  { name: 'Info', Icon: Info },
  { name: 'HelpCircle', Icon: HelpCircle },
  { name: 'AlertCircle', Icon: AlertCircle },
  { name: 'CheckCircle2', Icon: CheckCircle2 },
  { name: 'Briefcase', Icon: Briefcase },
  { name: 'Vote', Icon: Vote },
  { name: 'Star', Icon: Star },
  { name: 'Settings', Icon: Settings },
]

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.name, o.Icon])
)

/** Resolve um nome de ícone para o componente lucide (ou undefined). */
export function resolveIcon(name?: string | null): LucideIcon | undefined {
  return name ? ICON_MAP[name] : undefined
}

interface IconPickerProps {
  value: string
  onChange: (name: string) => void
  /** Injetado pelo <Field> para associar ao label/erro. */
  id?: string
  placeholder?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

export default function IconPicker({
  value,
  onChange,
  id,
  placeholder = 'Escolher ícone...',
  ...aria
}: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const Selected = resolveIcon(value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ICON_OPTIONS
    return ICON_OPTIONS.filter((o) => o.name.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    // foca a busca ao abrir
    searchRef.current?.focus()
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function select(name: string) {
    onChange(name)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-navy/25 focus:border-navy"
      >
        <span className="flex items-center gap-2 min-w-0">
          {Selected ? (
            <span className="w-7 h-7 rounded-md bg-navy/10 text-navy flex items-center justify-center shrink-0">
              <Selected className="w-4 h-4" />
            </span>
          ) : (
            <span className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
            </span>
          )}
          <span className={`truncate ${value ? 'font-mono text-foreground' : 'text-muted-foreground'}`}>
            {value || placeholder}
          </span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Remover ícone"
              title="Remover ícone"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange('')
                }
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[260px] rounded-xl border border-border bg-card shadow-lg p-2 animate-scale-in">
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ícone..."
              aria-label="Buscar ícone"
              className="w-full bg-muted/50 border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 focus:ring-navy/25 focus:border-navy"
            />
          </div>
          <div
            role="listbox"
            aria-label="Ícones disponíveis"
            className="grid grid-cols-6 gap-1 max-h-56 overflow-y-auto [scrollbar-width:thin]"
          >
            {filtered.map(({ name, Icon }) => {
              const isSelected = value === name
              return (
                <button
                  type="button"
                  key={name}
                  role="option"
                  aria-selected={isSelected}
                  title={name}
                  aria-label={name}
                  onClick={() => select(name)}
                  className={`flex items-center justify-center aspect-square rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-navy bg-navy/10 text-navy'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              Nenhum ícone encontrado para “{query}”.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
