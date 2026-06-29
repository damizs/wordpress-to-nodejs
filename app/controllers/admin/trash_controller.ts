import type { HttpContext } from '@adonisjs/core/http'
import TrashEntry from '#models/trash_entry'
import TrashService from '#services/trash_service'

function serializeDate(value: { toISO: () => string | null } | null | undefined) {
  return value ? value.toISO() : null
}

export default class TrashController {
  async index({ inertia }: HttpContext) {
    const entries = await TrashEntry.query()
      .whereNull('restored_at')
      .orderBy('deleted_at', 'desc')
      .limit(100)

    return inertia.render('admin/trash/index', {
      entries: entries.map((entry) => ({
        id: entry.id,
        tableName: entry.tableName,
        recordId: entry.recordId,
        displayName: entry.displayName,
        deletedByUserId: entry.deletedByUserId,
        deletedAt: serializeDate(entry.deletedAt),
        metadata: entry.metadata,
      })),
    })
  }

  async restore(ctx: HttpContext) {
    const { params, response, session } = ctx
    const entry = await TrashEntry.findOrFail(params.id)

    try {
      await TrashService.restore(entry, ctx)
      session.flash('success', 'Registro restaurado com sucesso.')
    } catch (error) {
      session.flash(
        'error',
        error instanceof Error ? error.message : 'Não foi possível restaurar o registro.'
      )
    }

    return response.redirect().toPath('/painel/lixeira')
  }
}
