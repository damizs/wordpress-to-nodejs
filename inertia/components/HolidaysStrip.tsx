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

/**
 * Faixa discreta com os próximos 2 feriados (nacionais calculados client-side
 * + municipais/estaduais do setting `municipal_holidays`). Montada na TopBar.
 */
export const HolidaysStrip = () => {
  const settings = useSiteSettings()
  const municipal = parseMunicipalHolidays(settings.municipal_holidays)
  const upcoming = nextHolidays(municipal, 2)

  if (upcoming.length === 0) return null

  const todayHoliday = upcoming.find((h) => isHolidayToday(h))

  if (todayHoliday) {
    return (
      <div className="flex items-center gap-1.5 py-2 text-[11px] md:text-xs font-medium tracking-wide">
        <Calendar className="w-3 h-3 text-gold shrink-0" />
        <span className="text-gold">
          Hoje: feriado de {todayHoliday.label} — sem expediente
        </span>
        <TypeChip type={todayHoliday.type} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-x-5 gap-y-0 flex-wrap py-2 text-[11px] md:text-xs font-medium tracking-wide">
      {upcoming.map((holiday, i) => (
        <span key={i} className="flex items-center gap-1.5 text-white/70">
          <Calendar className="w-3 h-3 text-gold/70 shrink-0" />
          <span>
            Feriado: {formatDay(holiday.date)} — {holiday.label}
          </span>
          <TypeChip type={holiday.type} />
        </span>
      ))}
    </div>
  )
}
