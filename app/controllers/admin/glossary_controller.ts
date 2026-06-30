import type { HttpContext } from '@adonisjs/core/http'
import GlossaryTerm from '#models/glossary_term'
import { generateSlug } from '#helpers/slug'

/** Normaliza a letra inicial de um verbete para A–Z (sem acento, maiúscula). */
function normalizeLetter(term: string): string | null {
  const source = (term || '').trim()
  if (!source) return null
  const c = source
    .charAt(0)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
  return /[A-Z]/.test(c) ? c : null
}

export default class GlossaryController {
  async index({ inertia }: HttpContext) {
    const items = await GlossaryTerm.query().orderBy('letter', 'asc').orderBy('term', 'asc')
    return inertia.render('admin/glossary/index', {
      items: items.map((i) => i.serialize()),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/glossary/form', { item: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['term', 'definition', 'display_order', 'is_active'])
    const term = String(data.term || '').trim()

    await GlossaryTerm.create({
      term,
      definition: String(data.definition || '').trim(),
      letter: normalizeLetter(term),
      slug: generateSlug(term) || null,
      displayOrder: Number.parseInt(data.display_order) || 0,
      isActive: data.is_active === 'true' || data.is_active === true,
    })

    session.flash('success', 'Termo cadastrado com sucesso!')
    return response.redirect().toPath('/painel/glossario')
  }

  async edit({ params, inertia }: HttpContext) {
    const item = await GlossaryTerm.findOrFail(params.id)
    return inertia.render('admin/glossary/form', { item: item.serialize() })
  }

  async update({ params, request, response, session }: HttpContext) {
    const item = await GlossaryTerm.findOrFail(params.id)
    const data = request.only(['term', 'definition', 'display_order', 'is_active'])
    const term = String(data.term || '').trim()

    item.merge({
      term,
      definition: String(data.definition || '').trim(),
      letter: normalizeLetter(term),
      slug: generateSlug(term) || null,
      displayOrder: Number.parseInt(data.display_order) || 0,
      isActive: data.is_active === 'true' || data.is_active === true,
    })
    await item.save()

    session.flash('success', 'Termo atualizado com sucesso!')
    return response.redirect().toPath('/painel/glossario')
  }

  async destroy({ params, response, session }: HttpContext) {
    const item = await GlossaryTerm.findOrFail(params.id)
    await item.delete()
    session.flash('success', 'Termo excluído com sucesso.')
    return response.redirect().toPath('/painel/glossario')
  }
}
