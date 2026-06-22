import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * PublicSoft/Elmar sao portais externos que o front abre em modal com iframe.
 * Mantem e-SIC/Ouvidoria/Radar em nova aba, pois sao fluxos independentes.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db
        .from('transparency_links')
        .where((query) => {
          query
            .whereILike('url', '%portaldatransparencia.publicsoft.com.br%')
            .orWhereILike('url', '%transparencia.elmartecnologia.com.br%')
        })
        .update({ open_mode: 'modal' })
    })
  }

  async down() {
    // Migration de dados: nao reverte escolhas manuais de abertura.
  }
}
