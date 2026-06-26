import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { DateTime } from 'luxon'

/**
 * Sincroniza o catálogo de matérias do GetPublic para o índice local
 * (`getpublic_materias`), tornando-as buscáveis no portal SEM armazenar os PDFs.
 * Idempotente: upsert por `codigo`. Agendável (cron diário).
 */
export default class GetPublicSync extends BaseCommand {
  static commandName = 'getpublic:sync'
  static description = 'Indexa as matérias do GetPublic (Diário/atos) para a busca do portal'
  static options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Simula sem gravar no banco' })
  declare dryRun: boolean

  async run() {
    const { default: GetPublicService } = await import('#services/getpublic_service')
    const { default: GetPublicMateria } = await import('#models/getpublic_materia')

    const svc = new GetPublicService()
    this.logger.info('Buscando catálogo de matérias no GetPublic…')
    const materias = await svc.listAllMaterias()
    this.logger.info(`Encontradas ${materias.length} matérias (deduplicadas por código).`)

    if (this.dryRun) {
      const porTipo: Record<string, number> = {}
      for (const m of materias) porTipo[m.tipo] = (porTipo[m.tipo] || 0) + 1
      this.logger.info(`Simulação — por tipo: ${JSON.stringify(porTipo)}`)
      return
    }

    const now = DateTime.now()
    let created = 0
    let updated = 0
    for (const m of materias) {
      const existing = await GetPublicMateria.findBy('codigo', m.codigo)
      const payload = {
        codigo: m.codigo,
        titulo: m.titulo.slice(0, 600),
        tipo: (m.tipo || '').slice(0, 120),
        diarioCodigo: m.diarioCodigo || null,
        diarioData: m.diarioData ? DateTime.fromISO(m.diarioData) : null,
        urlMateria: m.urlMateria.slice(0, 500),
        syncedAt: now,
      }
      if (existing) {
        existing.merge(payload)
        await existing.save()
        updated++
      } else {
        await GetPublicMateria.create(payload)
        created++
      }
    }

    this.logger.success(`OK: ${created} nova(s), ${updated} atualizada(s), total ${materias.length}.`)
  }
}
