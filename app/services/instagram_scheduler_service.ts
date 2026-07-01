/**
 * Instagram Scheduler Service
 *
 * Agendador EM PROCESSO (sem dependência externa de cron) que roda 1× por dia:
 *   1. Atualiza o feed do Instagram (seção "Siga-nos").
 *   2. Atualiza a galeria de Reels (página /videos).
 *   3. Roda a importação automática de posts → notícias (se habilitada no painel),
 *      usando o provedor de IA configurado (ex.: DeepSeek).
 *
 * Estratégia (heartbeat + guarda por data):
 * - Um "batimento" leve a cada {@link HEARTBEAT_MINUTES} minutos verifica se já
 *   passou do horário agendado do dia (cron_hour:cron_minute, fuso de Brasília) e
 *   se ainda NÃO rodou hoje (setting `last_daily_run` = yyyy-MM-dd). Se as duas
 *   condições baterem, executa e marca a data.
 * - Isso o torna robusto a reinícios (a data fica no banco), a janelas perdidas
 *   (se o servidor estava fora às 19h, roda no 1º batimento ao voltar) e a
 *   múltiplas execuções (a guarda por data impede rodar 2× no mesmo dia).
 * - Tudo é idempotente: refresh do feed/reels só sobrescreve cache; o auto-import
 *   pula posts já importados (InstagramImportLog).
 *
 * Inicializado por `start/scheduler.ts` apenas no ambiente `web`.
 */

import { DateTime } from 'luxon'
import InstagramSetting from '#models/instagram_setting'
import InstagramFeedService from './instagram_feed_service.js'
import InstagramAutoImporterService from './instagram_auto_importer_service.js'

/** Intervalo entre verificações (minutos). Leve: só lê settings e compara datas. */
const HEARTBEAT_MINUTES = 30
/** Atraso do 1º batimento após o boot (deixa app/DB subirem antes de tocar no banco). */
const FIRST_BEAT_MS = 90_000
/** Chave que guarda a data (yyyy-MM-dd, Brasília) da última execução diária. */
const LAST_RUN_KEY = 'last_daily_run'
const TZ = 'America/Sao_Paulo'

export default class InstagramSchedulerService {
  private static started = false
  private static timer: NodeJS.Timeout | null = null

  /** Inicia o agendador (idempotente — múltiplas chamadas não criam vários timers). */
  static start(): void {
    if (this.started) return
    this.started = true
    console.log('[InstagramScheduler] ativo — verificação diária a cada', HEARTBEAT_MINUTES, 'min')
    this.timer = setTimeout(() => this.beat(), FIRST_BEAT_MS)
    // Não segura o process.exit por causa do timer.
    this.timer.unref?.()
  }

  /** Para o agendador (usado em testes/shutdown). */
  static stop(): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.started = false
  }

  /** Um batimento: verifica se está na hora e, se sim, executa o ciclo diário. */
  private static async beat(): Promise<void> {
    try {
      if (await this.isDue()) {
        await this.runDaily()
        await InstagramSetting.set(LAST_RUN_KEY, DateTime.now().setZone(TZ).toISODate())
      }
    } catch (err: any) {
      console.error('[InstagramScheduler] erro no batimento:', err?.message)
    } finally {
      // Reagenda o próximo batimento.
      this.timer = setTimeout(() => this.beat(), HEARTBEAT_MINUTES * 60_000)
      this.timer.unref?.()
    }
  }

  /** Já passou do horário agendado de hoje e ainda não rodou hoje? */
  private static async isDue(): Promise<boolean> {
    const mode = (await InstagramSetting.get('cron_mode', 'daily')) || 'daily'
    const now = DateTime.now().setZone(TZ)

    // Modo teste: roda a cada batimento (~30 min), ignorando a guarda diária —
    // útil para validar rapidamente no painel. Trocar para "Diário" em produção.
    if (mode === 'test') return true

    const today = now.toISODate()
    const lastRun = await InstagramSetting.get(LAST_RUN_KEY)
    if (lastRun === today) return false // já rodou hoje

    const hour = this.clampNumber(await InstagramSetting.get('cron_hour', '19'), 0, 23, 19)
    const minute = this.clampNumber(await InstagramSetting.get('cron_minute', '0'), 0, 59, 0)
    const scheduledToday = now.set({ hour, minute, second: 0, millisecond: 0 })

    return now >= scheduledToday
  }

  /**
   * Ciclo diário: atualiza feed + reels e, se habilitado, roda o auto-import.
   * Cada etapa é isolada — uma falha não impede as outras.
   */
  static async runDaily(): Promise<void> {
    const startedAt = DateTime.now().setZone(TZ).toFormat('dd/MM/yyyy HH:mm:ss')
    console.log('[InstagramScheduler] ciclo diário iniciado em', startedAt)

    const profileUrl = await InstagramSetting.get('instagram_profile_url')
    if (!profileUrl) {
      console.log('[InstagramScheduler] perfil do Instagram não configurado — pulando refresh')
    } else {
      try {
        const n = await InstagramFeedService.refresh()
        console.log(`[InstagramScheduler] feed atualizado: ${n} itens`)
      } catch (err: any) {
        console.error('[InstagramScheduler] refresh do feed falhou:', err?.message)
      }

      try {
        const n = await InstagramFeedService.refreshReels()
        console.log(`[InstagramScheduler] reels atualizados: ${n} itens`)
      } catch (err: any) {
        console.error('[InstagramScheduler] refresh dos reels falhou:', err?.message)
      }
    }

    const autoEnabled = await InstagramSetting.get('auto_import_enabled')
    if (autoEnabled === 'true' || autoEnabled === '1') {
      try {
        const importer = new InstagramAutoImporterService()
        const result = await importer.runAutoImport()
        console.log(
          `[InstagramScheduler] auto-import: ${result.imported} importado(s), ${result.errors} erro(s)`
        )
      } catch (err: any) {
        console.error('[InstagramScheduler] auto-import falhou:', err?.message)
      }
    } else {
      console.log('[InstagramScheduler] auto-import desabilitado — só o feed/reels foi atualizado')
    }

    // GetPublic — mantém índice, módulos nativos e edições do Diário em dia.
    // Isolado: falha aqui não afeta o Instagram. Só roda se a API key existir.
    try {
      const { default: env } = await import('#start/env')
      if (env.get('GETPUBLIC_API_KEY')) {
        const { default: GetPublicService } = await import('#services/getpublic_service')
        const r = await new GetPublicService().syncAll()
        console.log(
          `[InstagramScheduler] GetPublic sync: total ${r.total} · índice +${r.materiasNew} · publicações +${r.publicationsNew} · licitações +${r.licitacoesNew} · contratos +${r.contractsNew}/${r.contractsUpdated} · diário +${r.diariosNew}`
        )
      } else {
        console.log('[InstagramScheduler] GETPUBLIC_API_KEY ausente — pulando sync do GetPublic')
      }
    } catch (err: any) {
      console.error('[InstagramScheduler] GetPublic sync falhou:', err?.message)
    }
  }

  private static clampNumber(
    raw: string | null,
    min: number,
    max: number,
    fallback: number
  ): number {
    const n = Number(raw)
    if (!Number.isFinite(n)) return fallback
    return Math.min(max, Math.max(min, Math.trunc(n)))
  }
}
