/**
 * ATRICON Snapshot Scheduler
 *
 * Agendador EM PROCESSO (sem cron externo) que grava 1× por dia o snapshot do
 * índice PNTP/ATRICON. O gráfico de evolução do Radar depende desses snapshots;
 * antes, eles só eram gravados ao rodar manualmente `node ace atricon:snapshot`,
 * então a série podia ficar com buracos. Agora roda sozinho no ambiente `web`.
 *
 * Estratégia (heartbeat + guarda por dia), espelhando o InstagramSchedulerService:
 * - Um batimento leve a cada {@link HEARTBEAT_MINUTES} minutos verifica se já passou
 *   do horário agendado e se ainda NÃO há snapshot de hoje.
 * - A guarda é PERSISTENTE: consultamos a própria tabela de snapshots (a gravação,
 *   via `writeDailySnapshot`, já é idempotente — no máximo 1 por dia). Isso torna o
 *   agendador robusto a reinícios e a janelas perdidas, sem nunca duplicar.
 * - A geração lê só o banco (matriz + auto-checagens); NÃO faz verificação HTTP de
 *   links externos, então é barata o suficiente para rodar em 2º plano.
 *
 * Inicializado por `start/scheduler.ts` apenas no ambiente `web`.
 */

import { DateTime } from 'luxon'

/** Intervalo entre verificações (minutos). Leve: 1 consulta para checar se já há snapshot hoje. */
const HEARTBEAT_MINUTES = 60
/** Atraso do 1º batimento após o boot (deixa app/DB subirem antes de tocar no banco). */
const FIRST_BEAT_MS = 120_000
/** Horário-alvo do snapshot diário (fuso de Brasília). Madrugada = baixa carga. */
const SNAPSHOT_HOUR = 3
const SNAPSHOT_MINUTE = 30
const TZ = 'America/Sao_Paulo'

export default class AtriconSchedulerService {
  private static started = false
  private static timer: NodeJS.Timeout | null = null

  /** Inicia o agendador (idempotente — múltiplas chamadas não criam vários timers). */
  static start(): void {
    if (this.started) return
    this.started = true
    console.log(
      `[AtriconScheduler] ativo — snapshot diário ~${SNAPSHOT_HOUR}:${String(SNAPSHOT_MINUTE).padStart(2, '0')} (BRT); verificação a cada ${HEARTBEAT_MINUTES} min`
    )
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

  /** Um batimento: se está na hora e ainda não snapshotou hoje, grava o snapshot. */
  private static async beat(): Promise<void> {
    try {
      if (await this.isDue()) {
        await this.runDaily()
      }
    } catch (err: any) {
      console.error('[AtriconScheduler] erro no batimento:', err?.message)
    } finally {
      // Reagenda o próximo batimento.
      this.timer = setTimeout(() => this.beat(), HEARTBEAT_MINUTES * 60_000)
      this.timer.unref?.()
    }
  }

  /** Já passou do horário agendado e ainda não existe snapshot de hoje? */
  private static async isDue(): Promise<boolean> {
    const now = DateTime.now().setZone(TZ)
    const scheduledToday = now.set({
      hour: SNAPSHOT_HOUR,
      minute: SNAPSHOT_MINUTE,
      second: 0,
      millisecond: 0,
    })
    if (now < scheduledToday) return false

    // Guarda persistente: mesmo critério de `writeDailySnapshot` (1 por dia).
    const { default: AtriconSnapshot } = await import('#models/atricon_snapshot')
    const last = await AtriconSnapshot.query().orderBy('created_at', 'desc').first()
    if (last && last.createdAt >= DateTime.now().startOf('day')) return false
    return true
  }

  /** Grava o snapshot diário do índice ATRICON (idempotente). */
  static async runDaily(): Promise<void> {
    const { recordAtriconSnapshot } = await import('#controllers/admin/atricon_controller')
    const { created, index, level } = await recordAtriconSnapshot()
    if (created) {
      console.log(`[AtriconScheduler] snapshot gravado: índice ${index}% (selo ${level})`)
    } else {
      console.log(`[AtriconScheduler] snapshot de hoje já existia — índice ${index}% (selo ${level})`)
    }
  }
}
