import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Sincroniza as matérias do GetPublic para o banco em DUAS tabelas:
 *  - `getpublic_materias` (índice de busca, sem armazenar PDFs);
 *  - `official_gazette_entries` (fonte da página pública do Diário Oficial).
 * Idempotente: upsert por `codigo`/`edition_number`. Agendável (diário) — também
 * roda no agendador em processo (`InstagramSchedulerService`).
 */
export default class GetPublicSync extends BaseCommand {
  static commandName = 'getpublic:sync'
  static description = 'Sincroniza matérias do GetPublic (busca + Diário Oficial)'
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

    this.logger.info('Sincronizando matérias do GetPublic (busca + Diário Oficial)…')
    const r = await svc.syncAll()
    this.logger.success(
      `OK: total ${r.total} matérias · índice: ${r.materiasNew} nova(s) · diário: ${r.gazetteNew} nova(s).`
    )
  }
}
