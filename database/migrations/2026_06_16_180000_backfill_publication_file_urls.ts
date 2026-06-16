import { BaseSchema } from '@adonisjs/lucid/schema'
import OfficialPublication from '#models/official_publication'
import { resolveDocumentFileUrl } from '#helpers/document_file_url'

/**
 * Preenche file_url das publicações importadas sem PDF (GetPublic, links no HTML).
 */
export default class extends BaseSchema {
  async up() {
    const publications = await OfficialPublication.query().where((q) => {
      q.whereNull('file_url').orWhere('file_url', '')
    })

    for (const publication of publications) {
      const resolved = resolveDocumentFileUrl(
        publication.fileUrl,
        publication.description,
        publication.number
      )
      if (resolved && resolved !== publication.fileUrl) {
        publication.fileUrl = resolved
        await publication.save()
      }
    }
  }

  async down() {
    // Não reverte — URLs resolvidas são válidas mesmo após rollback da migration.
  }
}
