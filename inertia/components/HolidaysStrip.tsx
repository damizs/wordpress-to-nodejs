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

  // Tanto no rodapé quanto no corpo a faixa fica sobre superfície ESCURA (navy):
  // no corpo, logo abaixo do cabeçalho em gradiente — por isso texto claro, para
  // ler como continuação do header em vez de um "risco" claro entre blocos escuros.
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

  // No corpo da home: faixa navy que se cola ao cabeçalho (continuação do header),
  // evitando a quebra visual de uma banda clara entre o header e seções escuras.
  return (
    <div className="bg-navy-dark text-primary-foreground border-b border-primary-foreground/10">
      <div className="container">{inner}</div>
    </div>
  )
}
