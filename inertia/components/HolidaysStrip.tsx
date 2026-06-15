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

interface HolidaysStripProps {
  /** 'footer': linha compacta com texto claro para o fundo navy do rodapé */
  variant?: 'default' | 'footer'
}

/**
 * Faixa discreta com os próximos 2 feriados (nacionais calculados client-side
 * + municipais/estaduais do setting `municipal_holidays`).
 * Montada no Footer, logo acima da bottom bar (variant="footer").
 */
export const HolidaysStrip = ({ variant = 'default' }: HolidaysStripProps) => {
  const settings = useSiteSettings()
  const municipal = parseMunicipalHolidays(settings.municipal_holidays)
  const upcoming = nextHolidays(municipal, 2)

  if (upcoming.length === 0) return null

  const todayHoliday = upcoming.find((h) => isHolidayToday(h))

  const isFooter = variant === 'footer'

  // Conteúdo interno (igual para footer e body, com cores de texto por variante)
  const baseText = isFooter ? 'text-primary-foreground/80' : 'text-muted-foreground'
  const labelText = isFooter ? 'text-primary-foreground/60' : 'text-muted-foreground'

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
      className={`flex items-center justify-center ${isFooter ? 'md:justify-start' : ''} gap-x-5 gap-y-0 flex-wrap py-2 text-[11px] md:text-xs font-medium tracking-wide`}
    >
      <span
        className={`flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-semibold ${labelText}`}
      >
        <Calendar className="w-3.5 h-3.5 text-gold shrink-0" aria-hidden="true" />
        Próximos feriados
      </span>
      {upcoming.map((holiday, i) => (
        <span key={i} className={`flex items-center gap-1.5 ${baseText}`}>
          <span>
            {formatDay(holiday.date)} — {holiday.label}
          </span>
          <TypeChip type={holiday.type} />
        </span>
      ))}
    </div>
  )

  // No rodapé é renderizado dentro do próprio container do footer (sem banda).
  if (isFooter) return inner

  // No corpo da home: banda discreta com tokens, alinhada ao container do site.
  return (
    <div className="bg-muted/50 border-b border-border">
      <div className="container mx-auto">{inner}</div>
    </div>
  )
}
