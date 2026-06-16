import { BaseSchema } from '@adonisjs/lucid/schema'
import OfficialPublication from '#models/official_publication'
import Licitacao from '#models/licitacao'
import { resolveDocumentFileUrl } from '#helpers/document_file_url'
import { routeMateria, materiaSlug } from '#helpers/materia_router'

/**
 * Remapeia conteúdo migrado do WP (GetPublic / diário / matérias) para os módulos
 * nativos corretos: atas de habilitação GetPublic → licitações; demais → publicações
 * com file_url; licitações existentes recebem PDF quando ausente.
 */
export default class extends BaseSchema {
  async up() {
    const publications = await OfficialPublication.query().orderBy('id', 'asc')
    let moved = 0
    let pubsUpdated = 0

    for (const pub of publications) {
      const route = routeMateria({
        tipo: pub.type,
        title: pub.title,
        description: pub.description,
        number: pub.number,
      })

      if (route.target === 'licitacao') {
        const slug = pub.slug || materiaSlug(pub.type, pub.number || '', pub.title)
        const year = Number.parseInt(String(pub.publicationDate || '').slice(0, 4)) || new Date().getFullYear()
        const fileUrl =
          route.fileUrl ||
          resolveDocumentFileUrl(pub.fileUrl, pub.description, pub.number)

        const existing = await Licitacao.findBy('slug', slug)
        if (existing) {
          existing.merge({
            title: pub.title,
            number: pub.number,
            modality: route.modality,
            object: pub.title,
            content: pub.description,
            year,
            fileUrl: fileUrl || existing.fileUrl,
            isActive: true,
          })
          await existing.save()
        } else {
          await Licitacao.create({
            title: pub.title,
            slug,
            number: pub.number,
            modality: route.modality,
            status: 'concluida',
            object: pub.title,
            content: pub.description,
            year,
            fileUrl,
            isActive: true,
          })
        }

        await pub.delete()
        moved++
        continue
      }

      if (route.target === 'publicacao') {
        const fileUrl =
          route.fileUrl ||
          resolveDocumentFileUrl(pub.fileUrl, pub.description, pub.number)
        let changed = false
        if (fileUrl && fileUrl !== pub.fileUrl) {
          pub.fileUrl = fileUrl
          changed = true
        }
        if (route.type && route.type !== pub.type) {
          pub.type = route.type
          changed = true
        }
        if (changed) {
          await pub.save()
          pubsUpdated++
        }
      }
    }

    // Licitações já importadas sem PDF (GetPublic no HTML)
    const licitacoes = await Licitacao.query().where((q) => {
      q.whereNull('file_url').orWhere('file_url', '')
    })
    let licUpdated = 0
    for (const lic of licitacoes) {
      const fileUrl = resolveDocumentFileUrl(lic.fileUrl, lic.content, lic.number)
      if (fileUrl) {
        lic.fileUrl = fileUrl
        await lic.save()
        licUpdated++
      }
    }

    console.log(
      `[remap] ${moved} publicação(ões) → licitações, ${pubsUpdated} publicações atualizadas, ${licUpdated} licitações com PDF`
    )
  }

  async down() {
    // Irreversível com segurança — registros movidos não são recriados em publicações.
  }
}
