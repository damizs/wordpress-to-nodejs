import type { HttpContext } from '@adonisjs/core/http'
import GlossaryTerm from '#models/glossary_term'
import SiteSetting from '#models/site_setting'

/** Normaliza a letra inicial de um verbete para A–Z (sem acento, maiúscula). */
function normalizeLetter(term: string, fallback?: string | null): string {
  const source = (term || '').trim() || (fallback || '').trim()
  const c = source
    .charAt(0)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
  return /[A-Z]/.test(c) ? c : '#'
}

export default class GlossaryController {
  async index({ inertia }: HttpContext) {
    const items = await GlossaryTerm.query()
      .where('is_active', true)
      .orderBy('term', 'asc')

    const terms = items
      .filter((i) => i.term.trim() && i.definition.trim())
      .map((i) => ({
        id: i.id,
        term: i.term,
        definition: i.definition,
        letter: i.letter || normalizeLetter(i.term),
      }))

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/glossary/index', {
      terms,
      siteSettings,
    })
  }
}
