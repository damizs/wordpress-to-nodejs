import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { seedAtasPautasFromSessions } from '#services/seed_atas_pautas_service'

export default class SeedAtasPautas extends BaseCommand {
  static commandName = 'seed:atas-pautas'
  static description =
    'Completa atas/pautas a partir de plenary_sessions sem sobrescrever cadastros manuais'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { atas, pautas } = await seedAtasPautasFromSessions()
    if (atas === 0 && pautas === 0) {
      this.logger.info('Nada a fazer (atas/pautas já sincronizadas com as sessões).')
      return
    }
    this.logger.success(`OK: ${atas} ata(s), ${pautas} pauta(s) criada(s).`)
  }
}
