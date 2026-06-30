/**
 * Inicia agendadores em processo. Carregado apenas no ambiente `web`
 * (ver `preloads` em adonisrc.ts) para não rodar durante comandos ace/migrations.
 */
import InstagramSchedulerService from '#services/instagram_scheduler_service'
import AtriconSchedulerService from '#services/atricon_scheduler_service'
import FreshnessAlertService from '#services/freshness_alert_service'

InstagramSchedulerService.start()
// Snapshot diário do índice ATRICON/PNTP (alimenta o gráfico de evolução do Radar).
AtriconSchedulerService.start()
// Alerta diário de frescor/pendências (WhatsApp via Evolution). OPT-IN por setting
// `freshness_alert_enabled`; degrada graciosamente e nunca derruba o boot/heartbeat.
FreshnessAlertService.start()
