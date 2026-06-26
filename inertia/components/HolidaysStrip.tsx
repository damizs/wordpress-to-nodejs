import { Calendar } from 'lucide-react'
import { useSiteSettings } from '~/hooks/use_site_settings'
import {
  isHolidayToday,
  nextHolidays,
  parseMunicipalHolidays,
  type Holiday,
} from '~/lib/holidays'

const TYPE_LABEL: Record<Holiday['type'], string> = {
  nacional: 'Nacional',
  municipal: 'Municipal',
  estadual: 'Estadual',
}

/** Quantidade de feriados no ticker (duplicados para loop infinito). */
const MARQUEE_COUNT = 10

function formatDay(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function TypeChip({ type }: { type: Holiday['type'] }) {
  const tone =
    type === 'nacional'
      ? 'bg-white/10 text-white/60'
      : type === 'municipal'
        ? 'bg-gold/20 text-gold'
        : 'bg-sky/20 text-sky'
  return (
    <span
      className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none ${tone}`}
    >
      {TYPE_LABEL[type]}
    </span>
  )
}

function HolidayEntry({ holiday }: { holiday: Holiday }) {
  return (
    <span className="flex items-center gap-2 shrink-0 text-primary-foreground/80 whitespace-nowrap">
      {/* separador discreto entre feriados (cara de ticker limpo) */}
      <span className="text-gold/40 text-base leading-none" aria-hidden="true">
        •
      </span>
      <span>
        <span className="font-semibold text-primary-foreground tabular-nums">{formatDay(holiday.date)}</span>
        <span className="text-primary-foreground/45"> · </span>
        {holiday.label}
      </span>
      <TypeChip type={holiday.type} />
    </span>
  )
}

function HolidaysMarquee({ holidays }: { holidays: Holiday[] }) {
  if (holidays.length === 0) return null

  // Preenche a faixa o suficiente para NÃO sobrar vazio antes do loop, mesmo com
  // poucos feriados (cada cópia precisa ser mais larga que a viewport em telas largas).
  const reps = Math.max(2, Math.ceil(9 / holidays.length))
  const filled = Array.from({ length: reps }).flatMap(() => holidays)

  const renderCopy = (copyKey: string, hidden?: boolean) => (
    <div className="flex items-center gap-5 shrink-0 pr-5" aria-hidden={hidden || undefined}>
      {filled.map((holiday, i) => (
        <HolidayEntry key={`${copyKey}-${i}-${holiday.date.getTime()}`} holiday={holiday} />
      ))}
    </div>
  )

  return (
    <div className="holidays-marquee" role="marquee" aria-label="Próximos feriados" aria-live="off">
      <div className="holidays-marquee-track">
        {renderCopy('a')}
        {renderCopy('b', true)}
      </div>
    </div>
  )
}

interface HolidaysStripProps {
  /** 'footer': linha compacta com texto claro para o fundo navy do rodapé */
  variant?: 'default' | 'footer'
}

/**
 * Faixa discreta com os próximos feriados em ticker contínuo (nacionais
 * calculados client-side + municipais/estaduais do setting `municipal_holidays`).
 * Montada no corpo da home, logo abaixo do cabeçalho.
 */
export const HolidaysStrip = ({ variant = 'default' }: HolidaysStripProps) => {
  const settings = useSiteSettings()
  const municipal = parseMunicipalHolidays(settings.municipal_holidays)
  const upcoming = nextHolidays(municipal, MARQUEE_COUNT)

  if (upcoming.length === 0) return null

  const todayHoliday = upcoming.find((h) => isHolidayToday(h))

  const isFooter = variant === 'footer'

  const baseText = 'text-primary-foreground/80'
  const labelText = 'text-primary-foreground/60'

  const inner = todayHoliday ? (
    <div
      className={`flex items-center justify-center ${isFooter ? 'md:justify-start' : ''} gap-1.5 py-2 text-[11px] md:text-xs font-medium tracking-wide`}
    >
      <Calendar className="w-3.5 h-3.5 text-gold shrink-0" aria-hidden="true" />
      <span className="text-gold font-semibold">
        Hoje: feriado de {todayHoliday.label} — sem expediente
      </span>
      <TypeChip type={todayHoliday.type} />
    </div>
  ) : (
    <div
      className={`flex items-center gap-4 py-2 text-[11px] md:text-xs font-medium tracking-wide min-w-0 ${
        isFooter ? 'md:justify-start' : ''
      }`}
    >
      <span
        className={`flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-semibold shrink-0 ${labelText}`}
      >
        <Calendar className="w-3.5 h-3.5 text-gold shrink-0" aria-hidden="true" />
        Próximos feriados
      </span>

      {/* divisor sutil entre a label fixa e o ticker (conecta os dois blocos) */}
      {upcoming.length > 1 && (
        <span className="h-3.5 w-px bg-primary-foreground/15 shrink-0" aria-hidden="true" />
      )}

      {upcoming.length === 1 ? (
        <span className={`flex items-center gap-1.5 min-w-0 ${baseText}`}>
          <span className="truncate">
            {formatDay(upcoming[0].date)} — {upcoming[0].label}
          </span>
          <TypeChip type={upcoming[0].type} />
        </span>
      ) : (
        <HolidaysMarquee holidays={upcoming} />
      )}
    </div>
  )

  if (isFooter) return inner

  return (
    <div className="bg-navy-dark text-primary-foreground border-b border-primary-foreground/10 overflow-hidden">
      <div className="container min-w-0">{inner}</div>
    </div>
  )
}
