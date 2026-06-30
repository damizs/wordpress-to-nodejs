/**
 * Freshness Alert Service
 *
 * Torna o "desatualizado" PROATIVO: calcula, por módulo, a última data de
 * registro (consulta leve `MAX(data)` + `COUNT(*)`) e compara com a meta de
 * frescor. Quando há módulos fora da meta e o recurso está LIGADO por setting,
 * envia um resumo via WhatsApp (Evolution) reaproveitando o EvolutionAlertService
 * já usado na tela de Segurança.
 *
 * Fonte ÚNICA do cálculo de frescor do painel: o DashboardController também
 * importa `computeFreshnessItem`/`parseDbDate` daqui, então o card "Frescor /
 * Pendências" do Dashboard e este alerta usam exatamente a mesma lógica — sem
 * duplicar (e sem reimplementar o cálculo do Radar ATRICON).
 *
 * Opt-in e degradação graciosa:
 * - `freshness_alert_enabled` (boolean, default OFF) — interruptor mestre.
 * - `freshness_alert_recipients` — números/contatos; se vazio, cai para os
 *   destinatários já configurados da Evolution (`evolution_recipients`).
 * - `freshness_alert_hour` — hora (0–23, BRT) do envio diário (default 8).
 * - `freshness_alert_last_run` — guarda interna (yyyy-MM-dd) para rodar 1×/dia.
 * Se nada estiver configurado (ou a Evolution desligada), o serviço apenas LOGA
 * e retorna `skipped` — nunca lança exceção que derrube o boot/heartbeat.
 *
 * Agendador EM PROCESSO (heartbeat + guarda por dia), espelhando
 * Atricon/Instagram SchedulerService. Inicializado por `start/scheduler.ts`
 * apenas no ambiente `web`.
 */

import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import SiteSetting from '#models/site_setting'
import EvolutionAlertService from '#services/evolution_alert_service'

export type FreshnessStatus = 'em_dia' | 'desatualizado' | 'vazio'

export interface FreshnessConfig {
  key: string
  label: string
  href: string
  table: string
  dateColumn: string
  thresholdDays: number
  apply?: (query: any) => any
}

export interface FreshnessItem {
  key: string
  label: string
  href: string
  total: number
  latest: string | null
  daysSince: number | null
  status: FreshnessStatus
  detail: string
}

/** Converte um valor de data vindo do banco (Date | ISO | SQL) em DateTime. */
export function parseDbDate(value: unknown): DateTime | null {
  if (!value) return null
  if (value instanceof Date) return DateTime.fromJSDate(value)
  const text = String(value)
  const iso = DateTime.fromISO(text)
  if (iso.isValid) return iso
  const sql = DateTime.fromSQL(text)
  return sql.isValid ? sql : null
}

/**
 * Calcula o frescor de UM módulo: total de registros + última data, comparados
 * com a meta (`thresholdDays`). Consulta leve (COUNT + MAX), sem tocar no Radar.
 * Exportada para o Dashboard reutilizar — mesma lógica em um só lugar.
 */
export async function computeFreshnessItem(config: FreshnessConfig): Promise<FreshnessItem> {
  const { key, label, href, table, dateColumn, thresholdDays, apply } = config
  const base = () => {
    const query = db.from(table)
    return apply ? apply(query) : query
  }

  const [totalRow, latestRow] = await Promise.all([
    base().count('* as total').first(),
    base().max(`${dateColumn} as latest`).first(),
  ])

  const total = Number(totalRow?.total ?? 0)
  const latest = parseDbDate(latestRow?.latest)
  const daysSince = latest ? Math.max(0, Math.floor(DateTime.now().diff(latest, 'days').days)) : null
  const status: FreshnessStatus =
    total === 0
      ? 'vazio'
      : latest && latest >= DateTime.now().minus({ days: thresholdDays })
        ? 'em_dia'
        : 'desatualizado'

  const detail =
    status === 'vazio'
      ? `Nenhum registro publicado. Cadastre o primeiro item em ${label}.`
      : status === 'desatualizado'
        ? `Última atualização há ${daysSince} dia(s). Meta: até ${thresholdDays} dia(s).`
        : `Atualizado dentro da meta de ${thresholdDays} dia(s).`

  return { key, label, href, total, latest: latest?.toISODate() ?? null, daysSince, status, detail }
}

/* ----------------------------------------------------------------------- */
/* Helpers de parsing dos settings (triviais — não é o cálculo do ATRICON). */
/* ----------------------------------------------------------------------- */

function parseBoolean(value: string | null | undefined, fallback = false) {
  if (value == null || value === '') return fallback
  return ['1', 'true', 'on', 'yes', 'sim'].includes(value.toLowerCase())
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

function clampHour(value: string | null | undefined, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(23, Math.max(0, Math.trunc(n)))
}

function dashboardUrl() {
  const baseUrl = process.env.APP_URL || process.env.PUBLIC_URL || ''
  if (!baseUrl) return '/painel'
  return `${baseUrl.replace(/\/+$/, '')}/painel`
}

const HEARTBEAT_MINUTES = 60
/** 1º batimento após o boot; escalonado depois de Instagram (90s) e Atricon (120s). */
const FIRST_BEAT_MS = 150_000
const TZ = 'America/Sao_Paulo'
const LAST_RUN_KEY = 'freshness_alert_last_run'
const SETTINGS_GROUP = 'notifications'

interface FreshnessAlertSettings {
  enabled: boolean
  recipients: string[]
  recipientsRaw: string
  usingEvolutionFallback: boolean
  hour: number
  lastRun: string | null
}

export default class FreshnessAlertService {
  private static started = false
  private static timer: NodeJS.Timeout | null = null

  /**
   * Módulos cobertos pelo alerta. Foco na META QUINZENAL (15 dias) de
   * atas/pautas/votações que o ATRICON acompanha, mais notícias (30 dias) como
   * sinal de frescor editorial. Cada item tem link direto pro módulo no painel.
   */
  static MODULES: FreshnessConfig[] = [
    {
      key: 'atas',
      label: 'Atas',
      href: '/painel/atas',
      table: 'atas',
      dateColumn: 'document_date',
      thresholdDays: 15,
      apply: (q) => q.where('is_published', true),
    },
    {
      key: 'pautas',
      label: 'Pautas',
      href: '/painel/pautas',
      table: 'pautas',
      dateColumn: 'document_date',
      thresholdDays: 15,
      apply: (q) => q.where('is_published', true),
    },
    {
      key: 'votacoes',
      label: 'Votações nominais',
      href: '/painel/votacoes',
      table: 'nominal_votings',
      dateColumn: 'voting_date',
      thresholdDays: 15,
      apply: (q) => q.where('is_published', true),
    },
    {
      key: 'noticias',
      label: 'Notícias',
      href: '/painel/noticias',
      table: 'news',
      dateColumn: 'published_at',
      thresholdDays: 30,
      apply: (q) => q.where('status', 'published'),
    },
  ]

  static async settings(): Promise<FreshnessAlertSettings> {
    const s = await SiteSetting.byGroup(SETTINGS_GROUP)
    const recipientsRaw = s.freshness_alert_recipients ?? ''
    let recipients = parseRecipients(recipientsRaw)
    let usingEvolutionFallback = false
    if (recipients.length === 0) {
      // Degrada para os destinatários já configurados da Evolution (Segurança).
      recipients = parseRecipients(s.evolution_recipients ?? '')
      usingEvolutionFallback = recipients.length > 0
    }

    return {
      enabled: parseBoolean(s.freshness_alert_enabled, false),
      recipients,
      recipientsRaw,
      usingEvolutionFallback,
      hour: clampHour(s.freshness_alert_hour, 8),
      lastRun: s.freshness_alert_last_run ?? null,
    }
  }

  /** Versão segura para a UI (sem expor números). */
  static async publicSettings() {
    const s = await this.settings()
    return {
      enabled: s.enabled,
      recipients: s.recipientsRaw,
      usingEvolutionFallback: s.usingEvolutionFallback,
      hasRecipients: s.recipients.length > 0,
      hour: s.hour,
      lastRun: s.lastRun,
    }
  }

  /** Calcula todos os módulos e devolve apenas os que estão fora da meta. */
  static async computeOutdated(): Promise<FreshnessItem[]> {
    const results = await Promise.all(
      this.MODULES.map(async (config) => {
        try {
          return await computeFreshnessItem(config)
        } catch (err: any) {
          // Tabela ausente/erro pontual não pode derrubar o alerta inteiro.
          console.error(`[FreshnessAlert] módulo "${config.key}" falhou:`, err?.message)
          return null
        }
      })
    )
    return results
      .filter((item): item is FreshnessItem => item !== null && item.status !== 'em_dia')
      .sort((a, b) => (b.daysSince ?? -1) - (a.daysSince ?? -1))
  }

  private static buildMessage(outdated: FreshnessItem[]): string {
    const data = DateTime.now().setZone(TZ).setLocale('pt-BR').toFormat('dd/LL/yyyy HH:mm')
    const linhas = outdated.map((item) => `- ${item.label}: ${item.detail}`).join('\n')
    return [
      `[Frescor / Pendências] - ${data}`,
      '',
      `${outdated.length} módulo(s) fora da meta de frescor:`,
      linhas,
      '',
      `Atualize no painel: ${dashboardUrl()}`,
    ].join('\n')
  }

  /**
   * Roda o alerta diário. Só envia se: opt-in ligado + há módulos atrasados.
   * Sempre degrada graciosamente (loga e retorna `skipped`), nunca lança.
   */
  static async runDailyAlert(options: { force?: boolean } = {}): Promise<{
    ok: boolean
    skipped: boolean
    reason: string
    outdated: FreshnessItem[]
  }> {
    try {
      const settings = await this.settings()
      if (!settings.enabled && !options.force) {
        return { ok: false, skipped: true, reason: 'Alerta de frescor desativado.', outdated: [] }
      }

      const outdated = await this.computeOutdated()
      if (outdated.length === 0) {
        console.log('[FreshnessAlert] tudo dentro da meta — nenhum alerta enviado.')
        return { ok: true, skipped: true, reason: 'Tudo dentro da meta.', outdated: [] }
      }

      const message = this.buildMessage(outdated)
      const summary = await EvolutionAlertService.sendToList(message, {
        recipients: settings.recipients,
        type: 'report',
        metadata: { kind: 'freshness', modules: outdated.map((o) => o.key) },
        dedupeKey: `freshness:${DateTime.now().setZone(TZ).toISODate()}`,
      })

      console.log(
        `[FreshnessAlert] ${outdated.length} módulo(s) atrasado(s) — ${summary.message}`
      )
      return {
        ok: summary.failed === 0,
        skipped: summary.success === 0 && summary.skipped > 0,
        reason: summary.message,
        outdated,
      }
    } catch (err: any) {
      console.error('[FreshnessAlert] runDailyAlert falhou:', err?.message)
      return { ok: false, skipped: true, reason: err?.message ?? 'erro', outdated: [] }
    }
  }

  /* --------------------------- Agendador em processo --------------------------- */

  /** Inicia o agendador (idempotente — múltiplas chamadas não criam vários timers). */
  static start(): void {
    if (this.started) return
    this.started = true
    console.log(
      `[FreshnessScheduler] ativo — alerta diário de frescor (opt-in); verificação a cada ${HEARTBEAT_MINUTES} min`
    )
    this.timer = setTimeout(() => this.beat(), FIRST_BEAT_MS)
    this.timer.unref?.()
  }

  /** Para o agendador (usado em testes/shutdown). */
  static stop(): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.started = false
  }

  /** Um batimento: se está na hora e ainda não rodou hoje, dispara o alerta. */
  private static async beat(): Promise<void> {
    try {
      if (await this.isDue()) {
        await this.runDailyAlert()
        // Marca o dia (mesmo sem envio) para não recomputar a cada batimento.
        await SiteSetting.setValue(
          LAST_RUN_KEY,
          DateTime.now().setZone(TZ).toISODate(),
          SETTINGS_GROUP,
          'text'
        )
      }
    } catch (err: any) {
      console.error('[FreshnessScheduler] erro no batimento:', err?.message)
    } finally {
      this.timer = setTimeout(() => this.beat(), HEARTBEAT_MINUTES * 60_000)
      this.timer.unref?.()
    }
  }

  /** Habilitado, já passou da hora agendada de hoje e ainda não rodou hoje? */
  private static async isDue(): Promise<boolean> {
    const settings = await this.settings()
    if (!settings.enabled) return false

    const now = DateTime.now().setZone(TZ)
    if (settings.lastRun === now.toISODate()) return false

    const scheduledToday = now.set({ hour: settings.hour, minute: 0, second: 0, millisecond: 0 })
    return now >= scheduledToday
  }
}
