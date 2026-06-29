import type { HttpContext } from '@adonisjs/core/http'
import ActivityLog from '#models/activity_log'

type ActivityPayload = {
  action: string
  resource: string
  resourceId?: string | number | null
  message?: string | null
  statusCode?: number | null
  metadata?: Record<string, unknown> | null
}

const SENSITIVE_KEY_PATTERN = /(password|senha|token|secret|api[_-]?key|authorization|cookie|sessionid|2fa|totp)/i

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => {
      if (SENSITIVE_KEY_PATTERN.test(key)) return [key, '[redacted]']
      return [key, redact(item)]
    })
  )
}

function getStatusCode(ctx: HttpContext): number | null {
  const response = ctx.response as unknown as { response?: { statusCode?: number } }
  return response.response?.statusCode ?? null
}

export default class ActivityLogService {
  static async log(ctx: HttpContext | null, payload: ActivityPayload) {
    try {
      await ActivityLog.create({
        userId: ctx?.auth.user?.id ?? null,
        action: payload.action,
        resource: payload.resource,
        resourceId: payload.resourceId == null ? null : String(payload.resourceId),
        method: ctx?.request.method() ?? null,
        path: ctx?.request.url(true) ?? null,
        ip: ctx?.request.ip() ?? null,
        userAgent: ctx?.request.header('user-agent') ?? null,
        statusCode: payload.statusCode ?? (ctx ? getStatusCode(ctx) : null),
        message: payload.message ?? null,
        metadata: payload.metadata ? (redact(payload.metadata) as Record<string, unknown>) : null,
      })
    } catch {
      // Logging must never block the user action.
    }
  }
}
