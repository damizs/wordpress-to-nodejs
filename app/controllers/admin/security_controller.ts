import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SiteSetting from '#models/site_setting'
import SecurityEvent from '#models/security_event'
import BackupRun from '#models/backup_run'
import NotificationLog from '#models/notification_log'
import BackupService from '#services/backup_service'
import EvolutionAlertService from '#services/evolution_alert_service'

function parseBooleanInput(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === '1'
}

function parseList(value: string | null | undefined) {
  if (!value) return []
  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function serializeDate(value: DateTime | null | undefined) {
  return value ? value.toISO() : null
}

export default class SecurityController {
  async index({ inertia }: HttpContext) {
    const settings = await SiteSetting.byGroup('security')
    const envStatus = BackupService.environmentStatus()
    let events: SecurityEvent[] = []
    let backups: BackupRun[] = []
    let notifications: NotificationLog[] = []
    let eventCount = 0
    let blockedCount = 0

    try {
      const [eventRows, backupRows, notificationRows, eventCountRow, blockedCountRow] = await Promise.all([
        SecurityEvent.query().orderBy('created_at', 'desc').limit(30),
        BackupRun.query().orderBy('created_at', 'desc').limit(10),
        NotificationLog.query().where('channel', 'evolution').orderBy('created_at', 'desc').limit(15),
        SecurityEvent.query().count('* as total').first(),
        SecurityEvent.query().where('action', 'block').count('* as total').first(),
      ])
      events = eventRows
      backups = backupRows
      notifications = notificationRows
      eventCount = Number(eventCountRow?.$extras.total ?? 0)
      blockedCount = Number(blockedCountRow?.$extras.total ?? 0)
    } catch {
      events = []
      backups = []
      notifications = []
    }

    const evolutionSettings = await EvolutionAlertService.publicSettings()
    const evolutionState = await EvolutionAlertService.connectionState()

    return inertia.render('admin/security/index', {
      firewall: {
        enabled: settings.security_firewall_enabled ?? 'true',
        mode: settings.security_firewall_mode ?? 'block',
        blockedIps: settings.security_firewall_blocked_ips ?? '',
        allowedIps: settings.security_firewall_allowed_ips ?? '',
        blockedPaths: settings.security_firewall_blocked_paths ?? '',
        eventCount,
        blockedCount,
      },
      backupEnv: envStatus,
      evolution: evolutionSettings,
      evolutionState,
      backups: backups.map((backup) => ({
        id: backup.id,
        status: backup.status,
        trigger: backup.trigger,
        startedAt: serializeDate(backup.startedAt),
        finishedAt: serializeDate(backup.finishedAt),
        localPath: backup.localPath,
        databasePath: backup.databasePath,
        uploadsPath: backup.uploadsPath,
        sizeBytes: backup.sizeBytes,
        providers: backup.providers ?? [],
        error: backup.error,
      })),
      events: events.map((event) => ({
        id: event.id,
        level: event.level,
        type: event.type,
        action: event.action,
        ip: event.ip,
        method: event.method,
        path: event.path,
        message: event.message,
        createdAt: serializeDate(event.createdAt),
      })),
      notifications: notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        status: notification.status,
        recipient: notification.recipient,
        message: notification.message,
        error: notification.error,
        sentAt: serializeDate(notification.sentAt),
        createdAt: serializeDate(notification.createdAt),
      })),
    })
  }

  /** JSON leve para o sininho de notificações no header do painel. */
  async recentNotifications({ response }: HttpContext) {
    try {
      const rows = await NotificationLog.query()
        .where('channel', 'evolution')
        .orderBy('created_at', 'desc')
        .limit(12)
      return response.json({
        items: rows.map((n) => ({
          id: n.id,
          type: n.type,
          status: n.status,
          message: n.message,
          createdAt: n.createdAt ? n.createdAt.toISO() : null,
        })),
      })
    } catch {
      return response.json({ items: [] })
    }
  }

  async updateFirewall({ request, response, session }: HttpContext) {
    const enabled = parseBooleanInput(request.input('enabled'))
    const mode = request.input('mode') === 'monitor' ? 'monitor' : 'block'
    const blockedIps = parseList(request.input('blocked_ips', '')).join('\n')
    const allowedIps = parseList(request.input('allowed_ips', '')).join('\n')
    const blockedPaths = parseList(request.input('blocked_paths', '')).join('\n')

    await SiteSetting.setValue('security_firewall_enabled', enabled ? 'true' : 'false', 'security')
    await SiteSetting.setValue('security_firewall_mode', mode, 'security')
    await SiteSetting.setValue('security_firewall_blocked_ips', blockedIps, 'security', 'text')
    await SiteSetting.setValue('security_firewall_allowed_ips', allowedIps, 'security', 'text')
    await SiteSetting.setValue('security_firewall_blocked_paths', blockedPaths, 'security', 'text')

    session.flash('success', 'Firewall atualizado com sucesso.')
    return response.redirect().toPath('/painel/seguranca')
  }

  async runBackup({ response, session }: HttpContext) {
    let backup: BackupRun
    try {
      backup = await BackupService.run({ trigger: 'manual' })
    } catch (error) {
      session.flash(
        'error',
        `Nao foi possivel iniciar o backup: ${error instanceof Error ? error.message : String(error)}`
      )
      return response.redirect().toPath('/painel/seguranca')
    }

    if (backup.status === 'success') {
      session.flash('success', 'Backup concluido com sucesso.')
    } else if (backup.status === 'partial') {
      session.flash('error', 'Backup local concluido, mas algum envio externo falhou.')
    } else {
      session.flash('error', backup.error || 'Nao foi possivel gerar o backup.')
    }

    return response.redirect().toPath('/painel/seguranca')
  }

  async updateEvolution({ request, response, session }: HttpContext) {
    const enabled = parseBooleanInput(request.input('enabled'))
    const baseUrl = String(request.input('base_url', '')).trim().replace(/\/+$/, '')
    const instance = String(request.input('instance', '')).trim()
    const apiKey = String(request.input('api_key', '')).trim()
    const recipients = parseList(request.input('recipients', '')).join('\n')
    const frequency = Math.max(Number.parseInt(String(request.input('report_frequency_days', '15')), 10) || 15, 1)
    const reportMessage = String(request.input('report_message', '') || '').trim()

    await SiteSetting.setValue('evolution_enabled', enabled ? 'true' : 'false', 'notifications', 'boolean')
    await SiteSetting.setValue('evolution_base_url', baseUrl, 'notifications')
    await SiteSetting.setValue('evolution_instance', instance, 'notifications')
    if (apiKey) {
      await SiteSetting.setValue('evolution_api_key', apiKey, 'notifications')
    }
    await SiteSetting.setValue('evolution_recipients', recipients, 'notifications', 'text')
    await SiteSetting.setValue(
      'evolution_report_frequency_days',
      String(frequency),
      'notifications',
      'number'
    )
    await SiteSetting.setValue('evolution_report_message', reportMessage, 'notifications', 'text')
    await SiteSetting.setValue(
      'evolution_alert_login_enabled',
      parseBooleanInput(request.input('alert_login_enabled')) ? 'true' : 'false',
      'notifications',
      'boolean'
    )
    await SiteSetting.setValue(
      'evolution_alert_firewall_enabled',
      parseBooleanInput(request.input('alert_firewall_enabled')) ? 'true' : 'false',
      'notifications',
      'boolean'
    )
    await SiteSetting.setValue(
      'evolution_alert_backup_enabled',
      parseBooleanInput(request.input('alert_backup_enabled')) ? 'true' : 'false',
      'notifications',
      'boolean'
    )

    session.flash('success', 'Alertas WhatsApp atualizados com sucesso.')
    return response.redirect().toPath('/painel/seguranca')
  }

  async testEvolution({ response, session }: HttpContext) {
    const summary = await EvolutionAlertService.sendToRecipients(
      `Teste de alerta do Portal da Camara de Sume em ${DateTime.now()
        .setLocale('pt-BR')
        .toFormat('dd/LL/yyyy HH:mm')}.`,
      'test',
      { source: 'admin_test' }
    )

    if (summary.failed > 0 || summary.success === 0) {
      session.flash('error', summary.message)
    } else {
      session.flash('success', summary.message)
    }
    return response.redirect().toPath('/painel/seguranca')
  }

  async sendEvolutionReport({ response, session }: HttpContext) {
    const summary = await EvolutionAlertService.sendBiweeklyReport({ force: true })

    if (summary.failed > 0 || summary.success === 0) {
      session.flash('error', summary.message)
    } else {
      session.flash('success', summary.message)
    }
    return response.redirect().toPath('/painel/seguranca')
  }
}
