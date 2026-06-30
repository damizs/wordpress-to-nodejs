import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import SiteSetting from '#models/site_setting'
import SecurityEvent from '#models/security_event'
import EvolutionAlertService from '#services/evolution_alert_service'
import { isShuttingDown } from '#services/shutdown_state'

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

/**
 * User-agents de ferramentas de CÓPIA/ESPELHAMENTO de sites (HTTrack, WebCopier
 * etc.). São bloqueadas para dificultar o "download" do portal inteiro. NÃO inclui
 * curl/python/navegadores legítimos nem bots de busca (Google/Bing) — apenas
 * rippers dedicados. Importante: isto ELEVA o custo, não impede 100% (um ator com
 * navegador real e UA falsa ainda consegue; conteúdo público é, por lei, aberto).
 */
const MIRROR_AGENTS =
  /httrack|htmls\b|webcopier|web copier|webreaper|teleport ?pro|offline ?explorer|getleft|sitesucker|web2disk|darcy|webzip|webstripper|grab-?site|wget|httraqt|idm\b|internet download manager/i

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
    response.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

    const path = request.url()

    // Liveness e arquivos estáticos NÃO podem depender do banco: em boot frio a
    // consulta de firewall (getFirewallSettings) deixaria o /health respondendo
    // 503/504 e quebraria o healthcheck do deploy.
    if (path === '/health') {
      // Shutdown gracioso ("fail health then drain"): durante o encerramento
      // respondemos 503 para o proxy/healthcheck marcar este container como
      // indisponível e PARAR de rotear, enquanto o servidor continua de pé
      // drenando as requisições reais já em voo. Fora do shutdown, mantém o
      // early-return barato de sempre (sem tocar o banco).
      if (isShuttingDown()) {
        response.header('Connection', 'close')
        response.header('Retry-After', '15')
        return response.status(503).send({ status: 'shutting_down' })
      }
      return next()
    }
    if (path.startsWith('/assets/') || path.startsWith('/uploads/')) {
      return next()
    }

    const method = request.method()
    const ip = request.ip()
    const userAgent = request.header('user-agent') || null

    const settings = await getFirewallSettings()
    if (!settings.enabled) return next()

    if (ipMatches(ip, settings.allowedIps)) {
      return next()
    }

    // Ferramentas de espelhamento/cópia do site (HTTrack & cia.) — bloqueadas
    // sempre (independe do modo monitor/block), pois não há uso legítimo delas
    // navegando o portal. Não afeta /health, /assets, /uploads (early-return acima).
    if (userAgent && MIRROR_AGENTS.test(userAgent)) {
      // Respeita o modo do firewall: em "monitor" apenas observa (não bloqueia),
      // evitando 403 em monitores externos legítimos que usem wget & cia.
      const block = settings.mode === 'block'
      await recordEvent({
        level: 'danger',
        type: 'site_mirror_tool',
        action: block ? 'block' : 'observe',
        ip,
        method,
        path,
        userAgent,
        message: block
          ? 'Ferramenta de cópia/espelhamento de site bloqueada.'
          : 'Ferramenta de cópia/espelhamento detectada (modo monitor — não bloqueada).',
        metadata: { tool: userAgent.slice(0, 120) },
      })
      if (block) {
        return response.status(403).send('Acesso automatizado de cópia do portal não é permitido.')
      }
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
