/**
 * Inicia agendadores em processo. Carregado apenas no ambiente `web`
 * (ver `preloads` em adonisrc.ts) para não rodar durante comandos ace/migrations.
 */
import InstagramSchedulerService from '#services/instagram_scheduler_service'

InstagramSchedulerService.start()
