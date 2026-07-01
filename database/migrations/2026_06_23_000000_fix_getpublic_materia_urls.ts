import { BaseSchema } from '@adonisjs/lucid/schema'
import db from '@adonisjs/lucid/services/db'
import { camara } from '#config/camara'

/**
 * Corrige o formato das URLs do GetPublic já gravadas: o link público correto é o
 * visualizador da matéria (visualizar-materia), e não o /api/document/<id>/pdf.
 * Reescreve sem apagar registros (o código de 14 dígitos já está correto).
 */
export default class extends BaseSchema {
  private tables = [
    'official_gazette_entries',
    'official_publications',
    'licitacao_documents',
    'legislative_activities',
  ]

  private API_RE = /^https:\/\/getpublic\.inf\.br\/api\/document\/(\d{14})\/pdf.*$/

  async up() {
    for (const table of this.tables) {
      let rows: Array<{ id: number; file_url: string | null }> = []
      try {
        rows = await db
          .from(table)
          .where('file_url', 'like', 'https://getpublic.inf.br/api/document/%')
          .select('id', 'file_url')
      } catch {
        // tabela/coluna pode não existir neste ambiente — ignora
        continue
      }
      for (const row of rows) {
        const match = String(row.file_url || '').match(this.API_RE)
        if (!match) continue
        const entity = camara.getpublicEntity || 'CMSU'
        const fixed = `https://getpublic.inf.br/system/visualizar-materia?materia=${match[1]}&link=${entity}`
        await db.from(table).where('id', row.id).update({ file_url: fixed })
      }
    }
  }

  async down() {
    // Sem rollback: o formato antigo (/api/document/<id>/pdf) era o link incorreto.
  }
}
