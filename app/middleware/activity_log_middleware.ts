import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import ActivityLogService from '#services/activity_log_service'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function resourceFromPath(path: string) {
  const [, first, second] = path.split('/')
  if (first !== 'painel') return first || 'site'
  return second || 'painel'
}

export default class ActivityLogMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const method = ctx.request.method()
    const path = ctx.request.url()
    const shouldLog = path.startsWith('/painel') && MUTATING_METHODS.has(method)

    if (!shouldLog) {
      return next()
    }

    const startedAt = Date.now()
    try {
      const output = await next()
      await ActivityLogService.log(ctx, {
        action: method.toLowerCase(),
        resource: resourceFromPath(path),
        metadata: { durationMs: Date.now() - startedAt },
      })
      return output
    } catch (error) {
      await ActivityLogService.log(ctx, {
        action: `${method.toLowerCase()}:error`,
        resource: resourceFromPath(path),
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Erro ao processar ação administrativa',
        metadata: { durationMs: Date.now() - startedAt },
      })
      throw error
    }
  }
}
