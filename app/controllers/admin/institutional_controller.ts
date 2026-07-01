import type { HttpContext } from '@adonisjs/core/http'
import InstitutionalContent from '#models/institutional_content'
import { sanitizeRichHtml } from '#helpers/sanitize_html'
import { buildInstitutionalEntries } from '#helpers/institutional_defaults'

export default class InstitutionalController {
  async index({ inertia }: HttpContext) {
    const defaultEntries = buildInstitutionalEntries()

    // Semeia (upsert por key) as entradas que ainda não existem no banco
    const existing = await InstitutionalContent.query().whereIn(
      'key',
      defaultEntries.map((d) => d.key)
    )
    const existingKeys = new Set(existing.map((e) => e.key))
    const missing = defaultEntries.filter((d) => !existingKeys.has(d.key))
    if (missing.length > 0) {
      const created = await InstitutionalContent.createMany(
        missing.map(({ key, title, content }) => ({ key, title, content }))
      )
      existing.push(...created)
    }

    const byKey = new Map(existing.map((e) => [e.key, e]))
    const entries = defaultEntries.map((d) => {
      const row = byKey.get(d.key)!
      return {
        key: row.key,
        title: row.title,
        content: row.content,
        page: d.page,
        updated_at: row.updatedAt ? row.updatedAt.toISO() : null,
      }
    })

    return inertia.render('admin/institutional/index', { entries })
  }

  async update({ params, request, response, session }: HttpContext) {
    const entry = await InstitutionalContent.findByOrFail('key', params.key)
    const data = request.only(['title', 'content'])

    const title = String(data.title ?? '').trim()
    entry.merge({
      title: title || entry.title,
      content: sanitizeRichHtml(data.content),
    })
    await entry.save()

    session.flash('success', 'Conteúdo atualizado com sucesso!')
    return response.redirect().toPath('/painel/institucional')
  }
}
