import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { seedAtasPautasFromSessions } from '#services/seed_atas_pautas_service'

export default class SeedAtasPautas extends BaseCommand {
  static commandName = 'seed:atas-pautas'
  static description =
    'Copia atas/pautas de plenary_sessions quando as tabelas novas estão vazias (idempotente)'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { atas, pautas } = await seedAtasPautasFromSessions()
    if (atas === 0 && pautas === 0) {
      this.logger.info('Nada a fazer (tabelas já populadas ou sessões sem conteúdo).')
      return
    }
    this.logger.success(`OK: ${atas} ata(s), ${pautas} pauta(s) criada(s).`)
  }
}
