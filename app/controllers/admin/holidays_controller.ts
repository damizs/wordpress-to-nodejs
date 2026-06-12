import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'

export interface MunicipalHoliday {
  /** 'YYYY-MM-DD' (data única) ou 'MM-DD' (recorre todo ano) */
  date: string
  label: string
  type: 'municipal' | 'estadual'
}

const FULL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const RECURRING_RE = /^\d{2}-\d{2}$/

function isValidDate(date: string): boolean {
  if (FULL_DATE_RE.test(date)) {
    const [y, m, d] = date.split('-').map(Number)
    const probe = new Date(y, m - 1, d)
    return probe.getMonth() === m - 1 && probe.getDate() === d
  }
  if (RECURRING_RE.test(date)) {
    const [m, d] = date.split('-').map(Number)
    return m >= 1 && m <= 12 && d >= 1 && d <= 31
  }
  return false
}

/** Sanitiza itens: descarta entradas sem rótulo ou com data inválida */
function cleanHolidays(items: any[]): MunicipalHoliday[] {
  if (!Array.isArray(items)) return []
  return items
    .filter(
      (i) =>
        i &&
        typeof i.label === 'string' &&
        i.label.trim() &&
        typeof i.date === 'string' &&
        isValidDate(i.date.trim())
    )
    .map((i) => ({
      date: i.date.trim(),
      label: i.label.trim(),
      type: i.type === 'estadual' ? ('estadual' as const) : ('municipal' as const),
    }))
}

function parseJson(raw: string | null): MunicipalHoliday[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return cleanHolidays(parsed)
  } catch {
    return []
  }
}

export default class HolidaysController {
  async index({ inertia }: HttpContext) {
    const holidays = parseJson(await SiteSetting.getValue('municipal_holidays'))
    return inertia.render('admin/holidays/index', { holidays })
  }

  async update({ request, response, session }: HttpContext) {
    try {
      const raw = request.input('holidays', [])
      const holidays = cleanHolidays(raw)

      await SiteSetting.setValue(
        'municipal_holidays',
        JSON.stringify(holidays),
        'holidays',
        'json'
      )

      const discarded = Array.isArray(raw) ? raw.length - holidays.length : 0
      session.flash(
        'success',
        discarded > 0
          ? `Feriados atualizados! ${discarded} item(ns) sem data válida ou rótulo foram descartados.`
          : 'Feriados atualizados com sucesso!'
      )
    } catch (error) {
      console.error('Error saving holidays:', error)
      session.flash('error', 'Erro ao salvar os feriados. Tente novamente.')
    }
    return response.redirect().back()
  }
}
