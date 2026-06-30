import { DateTime } from 'luxon'
import SiteSetting from '#models/site_setting'
import SecurityEvent from '#models/security_event'
import BackupRun from '#models/backup_run'
import NotificationLog from '#models/notification_log'

type AlertType = 'login' | 'firewall' | 'backup' | 'health'

interface EvolutionSettings {
  enabled: boolean
  baseUrl: string
  instance: string
  apiKey: string
  apiKeySet: boolean
  recipientsRaw: string
  recipients: string[]
  reportFrequencyDays: number
  reportMessage: string
  alertLoginEnabled: boolean
  alertFirewallEnabled: boolean
  alertBackupEnabled: boolean
  lastReportAt: string | null
}

interface SendSummary {
  success: number
  failed: number
  skipped: number
  message: string
}

const DEFAULT_REPORT_MESSAGE = `Relatorio quinzenal do Portal da Camara de Sume - {data}

Periodo: {periodo}
Eventos de seguranca: {eventos_seguranca}
Bloqueios do firewall: {bloqueios}
Ultimo backup: {ultimo_backup}

Painel: {url_painel}`

function parseBoolean(value: string | null | undefined, fallback = false) {
  if (value == null || value === '') return fallback
  return ['1', 'true', 'on', 'yes', 'sim'].includes(value.toLowerCase())
}

function parseInteger(value: string | null | undefined, fallback: number) {
  const parsed = Number.parseInt(value || '', 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return parsed
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '')
}

function normalizeRecipient(value: string) {
  const trimmed = value.trim()
  if (trimmed.includes('@')) return trimmed
  return trimmed.replace(/\D/g, '')
}

function parseRecipients(value: string) {
  return value
    .split(/[\n,;]/)
    .map(normalizeRecipient)
    .filter((item) => item.length >= 10 || item.includes('@'))
}

function renderTemplate(template: string, variables: Record<string, string | number>) {
  return template.replace(/\{([a-z0-9_]+)\}/gi, (_, key: string) => String(variables[key] ?? ''))
}

function getPanelUrl() {
  const baseUrl = process.env.APP_URL || process.env.PUBLIC_URL || ''
  if (!baseUrl) return '/painel/seguranca'
  return `${baseUrl.replace(/\/+$/, '')}/painel/seguranca`
}

function isOpenState(state: string | null) {
  if (!state) return false
  return ['open', 'connected', 'online', 'ok'].includes(state.toLowerCase())
}

async function countSecurityEvents(since: DateTime, action?: 'block') {
  try {
    const query = SecurityEvent.query().where('created_at', '>=', since.toSQL()!)
    if (action) query.where('action', action)
    const row = await query.count('* as total').first()
    return Number(row?.$extras.total ?? 0)
  } catch {
    return 0
  }
}

function formatDate(value: DateTime | null | undefined) {
  if (!value) return '-'
  return value.setLocale('pt-BR').toFormat('dd/LL/yyyy HH:mm')
}

function backupSummary(backup: BackupRun | null) {
  if (!backup) return 'nenhum backup registrado'
  const labels: Record<string, string> = {
    success: 'concluido',
    partial: 'parcial',
    failed: 'falhou',
    running: 'em andamento',
  }
  return `${labels[backup.status] ?? backup.status} em ${formatDate(backup.startedAt)}`
}

export default class EvolutionAlertService {
  static async settings(): Promise<EvolutionSettings> {
    const settings = await SiteSetting.byGroup('notifications')
    const recipientsRaw = settings.evolution_recipients ?? ''
    const apiKey = settings.evolution_api_key ?? ''

    return {
      enabled: parseBoolean(settings.evolution_enabled, false),
      baseUrl: normalizeBaseUrl(settings.evolution_base_url ?? ''),
      instance: settings.evolution_instance ?? '',
      apiKey,
      apiKeySet: Boolean(apiKey),
      recipientsRaw,
      recipients: parseRecipients(recipientsRaw),
      reportFrequencyDays: parseInteger(settings.evolution_report_frequency_days, 15),
      reportMessage: settings.evolution_report_message || DEFAULT_REPORT_MESSAGE,
      alertLoginEnabled: parseBoolean(settings.evolution_alert_login_enabled, true),
      alertFirewallEnabled: parseBoolean(settings.evolution_alert_firewall_enabled, true),
      alertBackupEnabled: parseBoolean(settings.evolution_alert_backup_enabled, true),
      lastReportAt: settings.evolution_last_report_at ?? null,
    }
  }

  static async publicSettings() {
    const settings = await this.settings()
    return {
      enabled: settings.enabled,
      baseUrl: settings.baseUrl,
      instance: settings.instance,
      apiKeySet: settings.apiKeySet,
      recipients: settings.recipientsRaw,
      reportFrequencyDays: settings.reportFrequencyDays,
      reportMessage: settings.reportMessage,
      alertLoginEnabled: settings.alertLoginEnabled,
      alertFirewallEnabled: settings.alertFirewallEnabled,
      alertBackupEnabled: settings.alertBackupEnabled,
      lastReportAt: settings.lastReportAt,
    }
  }

  static async connectionState() {
    const settings = await this.settings()
    if (!settings.enabled) return { ok: false, state: 'disabled', error: null }
    if (!settings.baseUrl || !settings.instance || !settings.apiKey) {
      return { ok: false, state: 'missing_config', error: 'Configure URL, instancia e API key.' }
    }

    try {
      const response = await fetch(
        `${settings.baseUrl}/instance/connectionState/${encodeURIComponent(settings.instance)}`,
        { headers: { apikey: settings.apiKey } }
      )
      const text = await response.text()
      let payload: any = null
      try {
        payload = text ? JSON.parse(text) : null
      } catch {
        payload = null
      }

      const state =
        payload?.instance?.state ??
        payload?.state ??
        payload?.status ??
        payload?.connection ??
        (response.ok ? 'ok' : null)

      if (!response.ok) {
        return { ok: false, state: state ? String(state) : null, error: text.slice(0, 500) }
      }

      return { ok: isOpenState(String(state)), state: String(state), error: null }
    } catch (error) {
      return {
        ok: false,
        state: null,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  private static async sendText(recipient: string, text: string, settings: EvolutionSettings) {
    const response = await fetch(
      `${settings.baseUrl}/message/sendText/${encodeURIComponent(settings.instance)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: settings.apiKey,
        },
        body: JSON.stringify({ number: recipient, text }),
      }
    )

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Evolution retornou ${response.status}: ${body.slice(0, 800)}`)
    }
  }

  static async sendToRecipients(
    message: string,
    type: NotificationLog['type'] = 'test',
    metadata: Record<string, unknown> = {},
    dedupeKey: string | null = null
  ): Promise<SendSummary> {
    // Delega para sendToList (sem destinatários explícitos => usa os configurados).
    return this.sendToList(message, { type, metadata, dedupeKey })
  }

  /**
   * Envia uma mensagem para uma lista EXPLÍCITA de destinatários (ou, se vazia,
   * cai para os destinatários configurados da Evolution). Reutiliza a mesma
   * conexão (baseUrl/instância/apiKey) e registra cada envio em NotificationLog.
   *
   * Base compartilhada por `sendToRecipients` (Segurança) e pelo alerta de
   * frescor (FreshnessAlertService) — um único loop de envio, sem duplicar.
   * Degrada graciosamente: se a Evolution estiver desligada/incompleta ou não
   * houver destinatários, retorna `skipped` sem lançar.
   */
  static async sendToList(
    message: string,
    options: {
      recipients?: string[]
      type?: NotificationLog['type']
      metadata?: Record<string, unknown>
      dedupeKey?: string | null
    } = {}
  ): Promise<SendSummary> {
    const settings = await this.settings()
    if (!settings.enabled) {
      return { success: 0, failed: 0, skipped: 1, message: 'Evolution desativada.' }
    }
    if (!settings.baseUrl || !settings.instance || !settings.apiKey) {
      return { success: 0, failed: 0, skipped: 1, message: 'Configuracao incompleta.' }
    }

    const recipients =
      options.recipients && options.recipients.length > 0
        ? options.recipients
        : settings.recipients
    if (recipients.length === 0) {
      return { success: 0, failed: 0, skipped: 1, message: 'Nenhum destinatario configurado.' }
    }

    const type = options.type ?? 'test'
    const metadata = options.metadata ?? {}
    const dedupeKey = options.dedupeKey ?? null

    const summary: SendSummary = { success: 0, failed: 0, skipped: 0, message: '' }
    for (const recipient of recipients) {
      const log = await NotificationLog.create({
        channel: 'evolution',
        type,
        status: 'pending',
        recipient,
        dedupeKey,
        message,
        metadata,
      })

      try {
        await this.sendText(recipient, message, settings)
        log.merge({ status: 'success', sentAt: DateTime.now(), error: null })
        summary.success += 1
      } catch (error) {
        log.merge({
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        })
        summary.failed += 1
      }
      await log.save()
    }

    summary.message =
      summary.failed > 0
        ? `${summary.success} enviado(s), ${summary.failed} falha(s).`
        : `${summary.success} mensagem(ns) enviada(s).`
    return summary
  }

  static async sendAlert(
    type: AlertType,
    title: string,
    message: string,
    options: { dedupeKey?: string; throttleMinutes?: number; metadata?: Record<string, unknown> } = {}
  ) {
    const settings = await this.settings()
    const enabledByType =
      type === 'login'
        ? settings.alertLoginEnabled
        : type === 'firewall'
          ? settings.alertFirewallEnabled
          : type === 'backup'
            ? settings.alertBackupEnabled
            : true

    if (!settings.enabled || !enabledByType) {
      return { success: 0, failed: 0, skipped: 1, message: 'Alerta desativado.' }
    }

    const dedupeKey = options.dedupeKey || `${type}:${title}`
    const throttleMinutes = options.throttleMinutes ?? 60
    const since = DateTime.now().minus({ minutes: throttleMinutes }).toSQL()!
    const duplicated = await NotificationLog.query()
      .where('channel', 'evolution')
      .where('dedupe_key', dedupeKey)
      .where('status', 'success')
      .where('created_at', '>=', since)
      .first()

    if (duplicated) {
      return { success: 0, failed: 0, skipped: 1, message: 'Alerta repetido suprimido.' }
    }

    const text = `[${title}]\n${message}\n\nPainel: ${getPanelUrl()}`
    return this.sendToRecipients(text, type, options.metadata ?? {}, dedupeKey)
  }

  static async sendBiweeklyReport(options: { force?: boolean } = {}) {
    const settings = await this.settings()
    if (!settings.enabled) {
      return { success: 0, failed: 0, skipped: 1, message: 'Evolution desativada.' }
    }

    const lastReportAt = settings.lastReportAt ? DateTime.fromISO(settings.lastReportAt) : null
    const dueAt = lastReportAt?.plus({ days: settings.reportFrequencyDays })
    if (!options.force && dueAt?.isValid && dueAt > DateTime.now()) {
      return {
        success: 0,
        failed: 0,
        skipped: 1,
        message: `Proximo relatorio em ${dueAt.setLocale('pt-BR').toFormat('dd/LL/yyyy')}.`,
      }
    }

    const since = DateTime.now().minus({ days: settings.reportFrequencyDays })
    const [eventCount, blockedCount, lastBackup] = await Promise.all([
      countSecurityEvents(since),
      countSecurityEvents(since, 'block'),
      BackupRun.query().orderBy('created_at', 'desc').first().catch(() => null),
    ])

    const message = renderTemplate(settings.reportMessage, {
      data: DateTime.now().setLocale('pt-BR').toFormat('dd/LL/yyyy HH:mm'),
      periodo: `${since.setLocale('pt-BR').toFormat('dd/LL/yyyy')} a ${DateTime.now()
        .setLocale('pt-BR')
        .toFormat('dd/LL/yyyy')}`,
      eventos_seguranca: eventCount,
      bloqueios: blockedCount,
      ultimo_backup: backupSummary(lastBackup),
      url_painel: getPanelUrl(),
    })

    const summary = await this.sendToRecipients(message, 'report', {
      kind: 'biweekly',
      days: settings.reportFrequencyDays,
    })

    if (summary.success > 0) {
      await SiteSetting.setValue(
        'evolution_last_report_at',
        DateTime.now().toISO(),
        'notifications',
        'text'
      )
    }

    return summary
  }

  static async runScheduledChecks() {
    const connection = await this.connectionState()
    if (connection.state !== 'disabled' && !connection.ok) {
      await NotificationLog.create({
        channel: 'evolution',
        type: 'health',
        status: 'failed',
        recipient: null,
        message: 'Verificacao de conexao da Evolution API.',
        error: connection.error || `Estado: ${connection.state || 'desconhecido'}`,
        metadata: { state: connection.state },
      }).catch(() => null)
    }

    const report = await this.sendBiweeklyReport({ force: false })
    return { connection, report }
  }
}
