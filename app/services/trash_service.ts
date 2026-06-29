import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import TrashEntry from '#models/trash_entry'
import ActivityLogService from '#services/activity_log_service'

type TrashableModel = {
  id?: string | number
  deletedAt?: DateTime | null
  save: () => Promise<unknown>
  delete: () => Promise<unknown>
  serialize: () => Record<string, unknown>
  constructor: {
    table?: string
    name?: string
  }
}

type TrashOptions = {
  displayName?: string | null
  resource?: string
  metadata?: Record<string, unknown>
}

const SOFT_DELETE_TABLES = new Set([
  'news',
  'atas',
  'pautas',
  'legislative_activities',
  'official_publications',
  'transparency_sections',
  'transparency_links',
  'information_records',
  'pages',
  'media_files',
  'faq_items',
  'plenary_sessions',
  'nominal_votings',
])

function tableFor(model: TrashableModel): string {
  return model.constructor.table ?? model.constructor.name ?? 'unknown'
}

export default class TrashService {
  static async moveToTrash(model: TrashableModel, ctx: HttpContext, options: TrashOptions = {}) {
    const now = DateTime.now()
    const tableName = tableFor(model)
    const recordId = String(model.id ?? '')

    await TrashEntry.create({
      tableName,
      recordId,
      displayName: options.displayName ?? null,
      data: model.serialize(),
      deletedByUserId: ctx.auth.user?.id ?? null,
      deletedAt: now,
      metadata: options.metadata ?? null,
    })

    if (SOFT_DELETE_TABLES.has(tableName)) {
      ;(model as TrashableModel).deletedAt = now
      await model.save()
    } else {
      await model.delete()
    }

    await ActivityLogService.log(ctx, {
      action: 'delete',
      resource: options.resource ?? tableName,
      resourceId: recordId,
      message: options.displayName ? `Movido para a lixeira: ${options.displayName}` : 'Movido para a lixeira',
      metadata: options.metadata ?? null,
    })
  }

  static async restore(entry: TrashEntry, ctx: HttpContext) {
    if (entry.restoredAt) return

    const restored = await db
      .from(entry.tableName)
      .where('id', entry.recordId)
      .whereNotNull('deleted_at')
      .update({
        deleted_at: null,
        updated_at: new Date(),
      })

    if (!restored) {
      throw new Error('Registro não encontrado ou já restaurado')
    }

    entry.restoredAt = DateTime.now()
    entry.restoredByUserId = ctx.auth.user?.id ?? null
    await entry.save()

    await ActivityLogService.log(ctx, {
      action: 'restore',
      resource: entry.tableName,
      resourceId: entry.recordId,
      message: entry.displayName ? `Restaurado da lixeira: ${entry.displayName}` : 'Restaurado da lixeira',
    })
  }
}
