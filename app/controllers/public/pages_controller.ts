import type { HttpContext } from '@adonisjs/core/http'
import Page from '#models/page'

/**
 * Busca uma Página publicada pelo slug.
 * Reutilizada pelo catch-all (DynamicInfoController) para dar precedência
 * às páginas criadas no painel sobre as categorias dinâmicas.
 */
export async function findPublishedPage(slug: string): Promise<Page | null> {
  return Page.query().where('slug', slug).where('is_published', true).first()
}

/** Renderiza a página pública padrão de uma Página (mesma view para ambas as rotas). */
export function renderPublicPage(inertia: HttpContext['inertia'], page: Page) {
  return inertia.render('public/pages/show', { page: page.serialize() })
}

export default class PagesController {
  async show({ params, inertia, response }: HttpContext) {
    const page = await findPublishedPage(params.slug)
    if (!page) {
      return response.notFound('Página não encontrada')
    }
    return renderPublicPage(inertia, page)
  }
}
