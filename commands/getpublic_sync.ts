import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Sincroniza o GetPublic sem misturar acervos:
 *  - `getpublic_materias` (índice de busca, sem armazenar PDFs);
 *  - matérias → Publicações Oficiais, Licitações ou Contratos quando aplicável;
 *  - Diário Oficial recebe somente edições diárias do endpoint de diários.
 * Idempotente por código/slug. Agendável — também roda no agendador em processo.
 */
export default class GetPublicSync extends BaseCommand {
  static commandName = 'getpublic:sync'
  static description = 'Sincroniza GetPublic (busca + módulos nativos + edições do Diário)'
  static options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Simula sem gravar no banco' })
  declare dryRun: boolean

  async run() {
    const { default: GetPublicService } = await import('#services/getpublic_service')
    const svc = new GetPublicService()

    if (this.dryRun) {
      this.logger.info('Buscando catálogo de matérias no GetPublic (simulação)…')
      const materias = await svc.listAllMaterias()
      const porTipo: Record<string, number> = {}
      for (const m of materias) porTipo[m.tipo] = (porTipo[m.tipo] || 0) + 1
      this.logger.info(
        `Simulação — ${materias.length} matérias. Por tipo: ${JSON.stringify(porTipo)}`
      )
      return
    }

    this.logger.info('Sincronizando GetPublic (busca + módulos nativos + edições do Diário)…')
    const r = await svc.syncAll()
    this.logger.success(
      `OK: ${r.total} matérias · índice +${r.materiasNew} · publicações +${r.publicationsNew} · licitações +${r.licitacoesNew} · contratos +${r.contractsNew}/${r.contractsUpdated} atualizados · diário +${r.diariosNew}.`
    )
  }
}
