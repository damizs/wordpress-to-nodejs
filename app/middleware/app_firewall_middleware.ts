import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import SiteSetting from '#models/site_setting'
import SecurityEvent from '#models/security_event'
import EvolutionAlertService from '#services/evolution_alert_service'

type FirewallMode = 'monitor' | 'block'

const SUSPICIOUS_PATTERNS = [
  /\.env(?:\.|$|\/|\?)/i,
  /\.git(?:\/|\?)/i,
  /wp-admin/i,
  /wp-login\.php/i,
  /xmlrpc\.php/i,
  /phpmyadmin/i,
  /vendor\/phpunit/i,
  /\/cgi-bin\//i,
  /\/actuator(?:\/|\?)/i,
  /\/boaform\//i,
  /\/HNAP1/i,
  /\/setup\.cgi/i,
]

function parseBoolean(value: string | null | undefined, fallback: boolean) {
  if (value == null || value === '') return fallback
  return ['1', 'true', 'on', 'yes', 'sim'].includes(value.toLowerCase())
}

function parseList(value: string | null | undefined) {
  if (!value) return []
  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function ipMatches(ip: string, list: string[]) {
  return list.some((item) => {
    if (item.endsWith('*')) return ip.startsWith(item.slice(0, -1))
    return item === ip
  })
}

async function getFirewallSettings() {
  try {
    const settings = await SiteSetting.byGroup('security')
    return {
      enabled: parseBoolean(settings.security_firewall_enabled, true),
      mode: (settings.security_firewall_mode === 'monitor' ? 'monitor' : 'block') as FirewallMode,
      blockedIps: parseList(settings.security_firewall_blocked_ips),
      allowedIps: parseList(settings.security_firewall_allowed_ips),
      blockedPaths: parseList(settings.security_firewall_blocked_paths),
    }
  } catch {
    return {
      enabled: true,
      mode: 'block' as FirewallMode,
      blockedIps: [],
      allowedIps: [],
      blockedPaths: [],
    }
  }
}

async function recordEvent(payload: {
  level: 'info' | 'warning' | 'danger'
  type: string
  action: 'observe' | 'block' | 'allow'
  ip: string
  method: string
  path: string
  userAgent: string | null
  message: string
  metadata?: Record<string, unknown>
}) {
  try {
    await SecurityEvent.create(payload)
  } catch {
    // Firewall must never take the portal down because the audit table is unavailable.
  }
}

export default class AppFirewallMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const path = request.url()
    const method = request.method()
    const ip = request.ip()
    const userAgent = request.header('user-agent') || null

    const settings = await getFirewallSettings()
    if (!settings.enabled) return next()

    if (ipMatches(ip, settings.allowedIps)) {
      return next()
    }

    const pathBlockedByConfig = settings.blockedPaths.some((rule) => path.includes(rule))
    const suspiciousMatch = SUSPICIOUS_PATTERNS.find((pattern) => pattern.test(path))
    const ipBlocked = ipMatches(ip, settings.blockedIps)
    const shouldAct = ipBlocked || pathBlockedByConfig || Boolean(suspiciousMatch)

    if (!shouldAct) return next()

    const action = settings.mode === 'block' ? 'block' : 'observe'
    await recordEvent({
      level: action === 'block' ? 'danger' : 'warning',
      type: ipBlocked ? 'blocked_ip' : pathBlockedByConfig ? 'blocked_path' : 'suspicious_probe',
      action,
      ip,
      method,
      path,
      userAgent,
      message:
        action === 'block'
          ? 'Requisicao bloqueada pelo firewall de aplicacao.'
          : 'Requisicao observada pelo firewall de aplicacao.',
      metadata: {
        mode: settings.mode,
        suspiciousPattern: suspiciousMatch?.source ?? null,
      },
    })

    if (action === 'block') {
      void EvolutionAlertService.sendAlert(
        'firewall',
        'Firewall bloqueou requisicao',
        `IP ${ip} tentou acessar ${method} ${path}. Tipo: ${
          ipBlocked ? 'IP bloqueado' : pathBlockedByConfig ? 'caminho bloqueado' : 'sondagem suspeita'
        }.`,
        {
          dedupeKey: `firewall:${ip}:${ipBlocked ? 'ip' : pathBlockedByConfig ? 'path' : 'probe'}`,
          throttleMinutes: 60,
          metadata: {
            ip,
            method,
            path,
            type: ipBlocked ? 'blocked_ip' : pathBlockedByConfig ? 'blocked_path' : 'suspicious_probe',
          },
        }
      ).catch(() => null)
      return response.status(403).send('Requisicao bloqueada pelo firewall do portal.')
    }

    return next()
  }
}
