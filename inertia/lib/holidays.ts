/**
 * Cálculo de feriados nacionais (client-side, puro) + mescla com feriados
 * municipais/estaduais cadastrados no painel (setting JSON `municipal_holidays`).
 */

export type HolidayType = 'nacional' | 'municipal' | 'estadual'

export interface Holiday {
  date: Date
  label: string
  type: HolidayType
}

export interface MunicipalHolidayInput {
  /** 'YYYY-MM-DD' (data única) ou 'MM-DD' (recorre todo ano) */
  date: string
  label: string
  type?: 'municipal' | 'estadual'
}

/**
 * Domingo de Páscoa pelo computus de Gauss na forma de Meeus/Jones/Butcher
 * (válido para todo o calendário gregoriano).
 */
export function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3 = março, 4 = abril
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  copy.setDate(copy.getDate() + days)
  return copy
}

/** Feriados nacionais (fixos + móveis derivados da Páscoa) de um ano. */
export function nationalHolidays(year: number): Holiday[] {
  const fixed: [number, number, string][] = [
    [1, 1, 'Confraternização Universal'],
    [4, 21, 'Tiradentes'],
    [5, 1, 'Dia do Trabalho'],
    [9, 7, 'Independência do Brasil'],
    [10, 12, 'Nossa Senhora Aparecida'],
    [11, 2, 'Finados'],
    [11, 15, 'Proclamação da República'],
    [11, 20, 'Dia da Consciência Negra'],
    [12, 25, 'Natal'],
  ]

  const easter = easterSunday(year)
  const movable: [Date, string][] = [
    [addDays(easter, -47), 'Carnaval'],
    [addDays(easter, -2), 'Sexta-feira Santa'],
    [addDays(easter, 60), 'Corpus Christi'],
  ]

  const holidays: Holiday[] = [
    ...fixed.map(([month, day, label]) => ({
      date: new Date(year, month - 1, day),
      label,
      type: 'nacional' as const,
    })),
    ...movable.map(([date, label]) => ({ date, label, type: 'nacional' as const })),
  ]

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime())
}

const FULL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const RECURRING_RE = /^(\d{2})-(\d{2})$/

/** Parse defensivo do JSON de feriados municipais vindo das settings. */
export function parseMunicipalHolidays(raw: string | null | undefined): MunicipalHolidayInput[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item: any): item is MunicipalHolidayInput =>
        item &&
        typeof item.date === 'string' &&
        (FULL_DATE_RE.test(item.date) || RECURRING_RE.test(item.date)) &&
        typeof item.label === 'string' &&
        item.label.trim() !== ''
    )
  } catch {
    return []
  }
}

/** Instancia um feriado municipal/estadual em datas concretas (recorrentes em mais de um ano). */
function expandMunicipal(item: MunicipalHolidayInput, years: number[]): Holiday[] {
  const type: HolidayType = item.type === 'estadual' ? 'estadual' : 'municipal'
  const label = item.label.trim()

  const full = FULL_DATE_RE.exec(item.date)
  if (full) {
    const [, y, m, d] = full
    return [{ date: new Date(Number(y), Number(m) - 1, Number(d)), label, type }]
  }

  const recurring = RECURRING_RE.exec(item.date)
  if (recurring) {
    const [, m, d] = recurring
    return years.map((year) => ({
      date: new Date(year, Number(m) - 1, Number(d)),
      label,
      type,
    }))
  }

  return []
}

/**
 * Próximos `count` feriados (nacionais + municipais/estaduais) a partir de hoje
 * (inclui o dia de hoje), ordenados por data.
 */
export function nextHolidays(
  municipal: MunicipalHolidayInput[],
  count: number,
  from: Date = new Date()
): Holiday[] {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const years = [today.getFullYear(), today.getFullYear() + 1]

  const all: Holiday[] = [
    ...years.flatMap((year) => nationalHolidays(year)),
    ...municipal.flatMap((item) => expandMunicipal(item, years)),
  ]

  return all
    .filter((h) => h.date.getTime() >= today.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count)
}

/** True se a data do feriado é hoje. */
export function isHolidayToday(holiday: Holiday, now: Date = new Date()): boolean {
  return (
    holiday.date.getFullYear() === now.getFullYear() &&
    holiday.date.getMonth() === now.getMonth() &&
    holiday.date.getDate() === now.getDate()
  )
}
