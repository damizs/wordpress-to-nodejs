import type { HttpContext } from '@adonisjs/core/http'
import SystemCategory from '#models/system_category'
import db from '@adonisjs/lucid/services/db'

const CATEGORIES_PATH = '/painel/acesso-informacao/categorias'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parseActive(value: unknown): boolean {
  // Inertia envia JSON (boolean real); aceita também '0'/'false' por segurança.
  return !(value === false || value === 'false' || value === '0' || value === 0)
}

/**
 * Gerência das CATEGORIAS de Acesso à Informação (system_categories type='information_record').
 *
 * Acesso restrito ao MASTER (super_admin): a estrutura de categorias é estrutural
 * (define slugs e páginas públicas), então é gerida apenas pelo administrador-mestre.
 * A edição dos REGISTROS continua com a permissão pntp.gerenciar.
 */
export default class InformationCategoriesController {
  /**
   * Gate master: só o super_admin gerencia categorias. Retorna true se já
   * respondeu (bloqueou) — o chamador deve dar return.
   */
  private blockNonMaster(ctx: HttpContext): boolean {
    if (ctx.auth.user?.role !== 'super_admin') {
      ctx.response.redirect('/painel/acesso-informacao')
      return true
    }
    return false
  }

  /** Contagem de registros por slug de categoria (todas, ativas e inativas). */
  private async countsBySlug(): Promise<Map<string, number>> {
    const rows = await db
      .from('information_records')
      .select('category')
      .count('* as total')
      .groupBy('category')
    return new Map<string, number>(rows.map((r: any) => [String(r.category), Number(r.total)]))
  }

  async index({ inertia, auth, response }: HttpContext) {
    if (this.blockNonMaster({ auth, response } as HttpContext)) return

    const [categories, counts] = await Promise.all([
      SystemCategory.query()
        .where('type', 'information_record')
        .orderBy('display_order', 'asc')
        .orderBy('name', 'asc'),
      this.countsBySlug(),
    ])

    return inertia.render('admin/information-categories/index', {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        grupo: c.grupo,
        display_order: c.displayOrder,
        is_active: c.isActive,
        count: counts.get(c.slug) ?? 0,
      })),
    })
  }

  async store({ request, response, session, auth }: HttpContext) {
    if (this.blockNonMaster({ auth, response } as HttpContext)) return

    const data = request.only(['name', 'slug', 'grupo', 'display_order', 'is_active'])
    const name = String(data.name ?? '').trim()
    if (!name) {
      session.flash('error', 'Informe o nome da categoria.')
      return response.redirect().back()
    }

    const slug = slugify(String(data.slug ?? '') || name)
    if (!slug) {
      session.flash('error', 'Não foi possível gerar um slug válido a partir do nome.')
      return response.redirect().back()
    }

    const clash = await SystemCategory.query()
      .where('type', 'information_record')
      .where('slug', slug)
      .first()
    if (clash) {
      session.flash('error', `Já existe uma categoria com o slug "${slug}". Escolha outro.`)
      return response.redirect().back()
    }

    await SystemCategory.create({
      type: 'information_record',
      name,
      slug,
      grupo: String(data.grupo ?? '').trim() || null,
      displayOrder: Number.parseInt(data.display_order) || 0,
      isActive: parseActive(data.is_active),
    })
    SystemCategory.clearCache()
    session.flash('success', 'Categoria criada com sucesso!')
    return response.redirect().toPath(CATEGORIES_PATH)
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    if (this.blockNonMaster({ auth, response } as HttpContext)) return

    const category = await SystemCategory.findOrFail(params.id)
    if (category.type !== 'information_record') {
      session.flash('error', 'Categoria inválida para este módulo.')
      return response.redirect().back()
    }

    const data = request.only(['name', 'slug', 'grupo', 'display_order', 'is_active'])
    const name = String(data.name ?? '').trim()
    if (!name) {
      session.flash('error', 'Informe o nome da categoria.')
      return response.redirect().back()
    }

    const usageRow = await db
      .from('information_records')
      .where('category', category.slug)
      .count('* as total')
      .first()
    const inUse = Number(usageRow?.total ?? 0)

    let slug = category.slug
    const requestedSlug = slugify(String(data.slug ?? ''))
    if (requestedSlug && requestedSlug !== category.slug) {
      // SEGURANÇA: a categoria é referenciada por SLUG em information_records.category
      // e nas páginas públicas (/:slug). Renomear o slug de uma categoria EM USO
      // quebraria a URL pública e deixaria registros órfãos. Por isso o slug só pode
      // mudar quando NÃO há registros vinculados — caso contrário, bloqueia com aviso.
      if (inUse > 0) {
        session.flash(
          'error',
          `Não é possível alterar o slug: existem ${inUse} registro(s) vinculados a "${category.slug}". Mova ou exclua os registros antes de renomear.`
        )
        return response.redirect().back()
      }
      const clash = await SystemCategory.query()
        .where('type', 'information_record')
        .where('slug', requestedSlug)
        .whereNot('id', category.id)
        .first()
      if (clash) {
        session.flash('error', `Já existe uma categoria com o slug "${requestedSlug}". Escolha outro.`)
        return response.redirect().back()
      }
      slug = requestedSlug
    }

    category.merge({
      name,
      slug,
      grupo: String(data.grupo ?? '').trim() || null,
      displayOrder: Number.parseInt(data.display_order) || 0,
      isActive: parseActive(data.is_active),
    })
    await category.save()
    SystemCategory.clearCache()
    session.flash('success', 'Categoria atualizada!')
    return response.redirect().toPath(CATEGORIES_PATH)
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    if (this.blockNonMaster({ auth, response } as HttpContext)) return

    const category = await SystemCategory.findOrFail(params.id)
    if (category.type !== 'information_record') {
      session.flash('error', 'Categoria inválida para este módulo.')
      return response.redirect().back()
    }

    const usageRow = await db
      .from('information_records')
      .where('category', category.slug)
      .count('* as total')
      .first()
    const inUse = Number(usageRow?.total ?? 0)
    if (inUse > 0) {
      session.flash(
        'error',
        `Existem ${inUse} registro(s) nesta categoria; mova ou exclua os registros antes de remover a categoria.`
      )
      return response.redirect().back()
    }

    await category.delete()
    SystemCategory.clearCache()
    session.flash('success', 'Categoria excluída!')
    return response.redirect().toPath(CATEGORIES_PATH)
  }
}
