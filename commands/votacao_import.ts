import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { importNominalVotingsFromXml } from '#services/nominal_voting_xml_importer'

export default class VotacaoImport extends BaseCommand {
  static commandName = 'votacao:import'
  static description = 'Importa votações nominais a partir de XMLs ou ZIP com XMLs de sessão'
  static options: CommandOptions = { startApp: true }

  @args.string({ description: 'Diretório, arquivo XML ou ZIP com relatórios de sessão' })
  declare source: string

  @flags.boolean({ description: 'Analisa os XMLs e mostra estatísticas sem gravar no banco' })
  declare dryRun: boolean

  async run() {
    const stats = await importNominalVotingsFromXml(this.source, {
      dryRun: this.dryRun,
      logger: this.logger,
    })

    if (stats.files === 0) {
      this.logger.warning('Nenhum arquivo XML encontrado.')
      this.exitCode = 1
      return
    }

    const action = stats.dryRun ? 'analisada(s)' : 'importada(s)'
    this.logger.success(
      `${stats.parsed} votação(ões) ${action}: ${stats.created} criada(s), ${stats.updated} atualizada(s), ${stats.entries} voto(s).`
    )

    if (stats.unmatchedVoters.length > 0) {
      this.logger.warning(
        `Votantes sem match (${stats.unmatchedVoters.length}): ${stats.unmatchedVoters.join(', ')}`
      )
    }

    if (stats.unmatchedActivities.length > 0) {
      this.logger.warning(
        `Proposições sem matéria vinculada (${stats.unmatchedActivities.length}): ${stats.unmatchedActivities
          .slice(0, 20)
          .join('; ')}${stats.unmatchedActivities.length > 20 ? '...' : ''}`
      )
    }
  }
}
