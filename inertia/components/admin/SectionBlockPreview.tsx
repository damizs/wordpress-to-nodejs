import { sectionShellProps, type SectionStyleConfig, type TemplateCustomConfig } from '~/lib/template-config'
import type { HomeSectionKey } from '~/lib/templates'

interface Props {
  section: HomeSectionKey
  style: SectionStyleConfig
  draft: TemplateCustomConfig
}

/** Miniatura esquemática da seção da home — reflete fundo e layout escolhidos. */
export function SectionBlockPreview({ section, style, draft }: Props) {
  const shell = sectionShellProps(style)
  const onNavy = style.bgTone === 'navy' || (style.bgTone === 'custom' && isDarkHex(style.bgColor))
  const fg = onNavy ? 'text-primary-foreground/90' : 'text-foreground'
  const muted = onNavy ? 'text-primary-foreground/55' : 'text-muted-foreground'
  const card = onNavy ? 'bg-white/10 border-white/15' : 'bg-card border-border/60'
  const chip = onNavy ? 'bg-gold/25 text-gold' : 'bg-primary/10 text-primary'

  const newsLayout = draft.newsLayout || 'mosaico'
  const newsCount = draft.newsCount ?? 5

  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
        Prévia do bloco
      </p>
      <div
        className={`rounded-xl border border-border overflow-hidden shadow-inner ${shell.className ?? 'bg-background'}`}
        style={shell.style}
      >
        <div className={`p-3 sm:p-4 ${fg}`}>
          <PreviewHeading section={section} chipClass={chip} fg={fg} muted={muted} />
          <div className="mt-3">{renderBody(section, { card, muted, fg, newsLayout, newsCount, onNavy })}</div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
        Aparência aproximada — conteúdo real vem do painel e do site.
      </p>
    </div>
  )
}

function PreviewHeading({
  section,
  chipClass,
  fg,
  muted,
}: {
  section: HomeSectionKey
  chipClass: string
  fg: string
  muted: string
}) {
  const titles: Partial<Record<HomeSectionKey, string>> = {
    news: 'Notícias',
    quickaccess: 'Acesso Rápido',
    esic: 'E-SIC',
    transparency: 'Transparência',
    vereadores: 'Vereadores',
    legislativo: 'Legislativo em Números',
    diario: 'Diário Oficial',
    instagram: 'Instagram',
    reels: 'Vídeos',
    conheca: 'Conheça a Cidade',
    seals: 'Certificações',
    survey: 'Pesquisa',
  }
  return (
    <div className="text-center">
      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide mb-1.5 ${chipClass}`}>
        Seção
      </span>
      <p className={`text-xs font-bold ${fg}`}>{titles[section] ?? section}</p>
      <div className={`mx-auto mt-1 h-0.5 w-8 rounded-full ${onNavyChip(muted) ? 'bg-gold/60' : 'bg-gold'}`} />
    </div>
  )
}

function onNavyChip(muted: string) {
  return muted.includes('primary-foreground')
}

function renderBody(
  section: HomeSectionKey,
  ctx: {
    card: string
    muted: string
    fg: string
    newsLayout: string
    newsCount: number
    onNavy: boolean
  }
) {
  const { card, muted, fg, newsLayout, newsCount, onNavy } = ctx
  const bar = onNavy ? 'bg-white/20' : 'bg-muted'
  const accent = onNavy ? 'bg-gold/40' : 'bg-navy/20'
  const sky = onNavy ? 'bg-sky/30' : 'bg-sky/20'

  switch (section) {
    case 'news':
      return <NewsPreview layout={newsLayout} count={newsCount} card={card} bar={bar} accent={accent} onNavy={onNavy} />
    case 'quickaccess':
      return (
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${card} border rounded-lg p-1.5 flex flex-col items-center gap-1`}>
              <div className={`w-5 h-5 rounded-full ${i % 2 ? accent : sky}`} />
              <div className={`h-1 w-full rounded ${bar}`} />
            </div>
          ))}
        </div>
      )
    case 'esic':
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className={`${card} border rounded-lg p-2 space-y-1.5`}>
            <div className={`h-1.5 w-2/3 rounded ${bar}`} />
            <div className={`h-4 rounded-md ${accent}`} />
            <div className={`h-4 rounded-md ${sky}`} />
          </div>
          <div className={`rounded-lg p-2 border border-gold/30 bg-gradient-to-br from-navy/80 to-navy space-y-1.5`}>
            <div className="h-1.5 w-1/2 rounded bg-gold/40" />
            <div className="h-1 w-full rounded bg-white/20" />
            <div className="h-1 w-4/5 rounded bg-white/20" />
          </div>
        </div>
      )
    case 'transparency':
      return (
        <div className="space-y-2">
          <div className="rounded-lg bg-gradient-hero p-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-1 w-2/3 rounded bg-white/30" />
              <div className="h-1 w-full rounded bg-white/20" />
            </div>
          </div>
          <div className="flex gap-1.5 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${card} border rounded-lg p-2 shrink-0 w-[28%] flex flex-col items-center gap-1`}>
                <div className={`w-5 h-5 rounded-full ${bar}`} />
                <div className={`h-1 w-full rounded ${bar}`} />
              </div>
            ))}
          </div>
        </div>
      )
    case 'vereadores':
      return (
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${card} border rounded-lg overflow-hidden shrink-0 w-[30%]`}>
              <div className={`aspect-[3/4] ${bar}`} />
              <div className="p-1 space-y-0.5">
                <div className={`h-1 w-full rounded ${bar}`} />
                <div className={`h-1 w-2/3 rounded ${bar}`} />
              </div>
            </div>
          ))}
        </div>
      )
    case 'legislativo':
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            {[accent, sky].map((c, i) => (
              <div key={i} className={`${card} border rounded-lg px-2 py-1.5 flex items-center gap-1.5 flex-1`}>
                <div className={`w-4 h-4 rounded ${c}`} />
                <div className="space-y-0.5 flex-1">
                  <div className={`h-1.5 w-4 rounded ${bar}`} />
                  <div className={`h-1 w-full rounded ${bar}`} />
                </div>
              </div>
            ))}
          </div>
          <div className={`${card} border rounded-lg p-2`}>
            <div className="flex items-end gap-0.5 h-10">
              {[40, 65, 45, 80, 55, 70].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t ${onNavy ? 'bg-gold/50' : 'bg-navy/30'}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${card} border rounded-md p-1.5 shrink-0 w-[32%] h-8`}>
                <div className={`h-1 w-full rounded ${bar}`} />
              </div>
            ))}
          </div>
        </div>
      )
    case 'diario':
      return (
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <div className={`${card} border rounded-lg p-2 space-y-1`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`h-1.5 rounded ${bar}`} style={{ width: `${90 - i * 15}%` }} />
            ))}
          </div>
          <div className="rounded-lg bg-gradient-hero p-1.5 grid grid-cols-7 gap-px">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className={`aspect-square rounded-sm ${i === 5 ? 'bg-gold/60' : 'bg-white/15'}`} />
            ))}
          </div>
        </div>
      )
    case 'instagram':
      return (
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${card} border rounded-md overflow-hidden shrink-0 w-[23%]`}>
              <div className={`aspect-square ${bar}`} />
            </div>
          ))}
        </div>
      )
    case 'reels':
      return (
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${card} border rounded-md aspect-[9/16] ${bar}`} />
          ))}
        </div>
      )
    case 'conheca':
      return (
        <div className="grid grid-cols-2 gap-2 items-center">
          <div className={`rounded-lg aspect-[4/3] ${bar}`} />
          <div className="space-y-1">
            <div className={`h-1.5 w-full rounded ${bar}`} />
            <div className={`h-1 w-4/5 rounded ${bar}`} />
            <div className={`h-1 w-full rounded ${bar}`} />
            <div className={`h-3 w-1/2 rounded-md mt-1 ${accent}`} />
          </div>
        </div>
      )
    case 'seals':
      return (
        <div className="flex justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full ${onNavy ? 'bg-white/15 ring-1 ring-white/20' : 'bg-muted'}`} />
              <div className={`h-1 w-10 rounded ${bar}`} />
            </div>
          ))}
        </div>
      )
    case 'survey':
      return (
        <div className={`${card} border rounded-lg p-2 flex items-center gap-2`}>
          <div className={`w-7 h-7 rounded-full shrink-0 ${accent}`} />
          <div className="flex-1 space-y-1 min-w-0">
            <div className={`h-1.5 w-2/3 rounded ${bar}`} />
            <div className={`h-1 w-full rounded ${bar}`} />
          </div>
          <div className={`h-5 w-12 rounded-md shrink-0 ${onNavy ? 'bg-gold/40' : 'bg-navy/80'}`} />
        </div>
      )
    default:
      return <div className={`h-12 rounded-lg ${bar}`} />
  }
}

function NewsPreview({
  layout,
  count,
  card,
  bar,
  accent,
  onNavy,
}: {
  layout: string
  count: number
  card: string
  bar: string
  accent: string
  onNavy: boolean
}) {
  const img = onNavy ? 'bg-white/15' : 'bg-muted'
  const smallCount = Math.min(Math.max(count - 1, 1), 4)

  if (layout === 'grade') {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <div key={i} className={`${card} border rounded-md overflow-hidden`}>
            <div className={`aspect-[4/3] ${img}`} />
            <div className="p-1 space-y-0.5">
              <div className={`h-1 w-full rounded ${bar}`} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (layout === 'lista' || layout === 'destaque') {
    return (
      <div className="space-y-1.5">
        <div className={`rounded-md overflow-hidden ${img} min-h-[36px]`} />
        <div className="grid grid-cols-2 gap-1">
          {Array.from({ length: Math.min(smallCount, 4) }).map((_, i) => (
            <div key={i} className={`${card} border rounded p-1 overflow-hidden`}>
              <div className={`aspect-[16/10] ${bar} mb-0.5`} />
              <div className={`h-1 w-full rounded ${bar}`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // mosaico (padrão)
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <div className={`rounded-md overflow-hidden ${img} min-h-[56px] relative`}>
        <div className={`absolute bottom-0 inset-x-0 p-1 bg-gradient-to-t ${onNavy ? 'from-navy-dark' : 'from-background'} to-transparent`}>
          <div className={`h-1 w-3/4 rounded ${onNavy ? 'bg-white/30' : bar}`} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {Array.from({ length: smallCount }).map((_, i) => (
          <div key={i} className={`rounded-sm overflow-hidden ${img} aspect-square`} />
        ))}
      </div>
    </div>
  )
}

function isDarkHex(hex?: string): boolean {
  if (!hex || !hex.startsWith('#')) return false
  const h = hex.slice(1)
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  if (full.length !== 6) return false
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
