import type { HttpContext } from '@adonisjs/core/http'
import InformationRecord from '#models/information_record'
import SystemCategory from '#models/system_category'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { sanitizeRichHtml } from '#helpers/sanitize_html'
import { assertSafeUpload } from '#helpers/upload_security'
import TrashService from '#services/trash_service'

export default class InformationRecordsController {
  /**
   * Visão geral (estilo plugin PNTP): quando NÃO há ?category, devolve a lista de
   * categorias agrupadas por `grupo` com a contagem de registros e as estatísticas
   * (total/com registros/vazias/progresso). Quando há ?category, devolve também os
   * registros paginados daquela categoria + os anos disponíveis para o filtro.
   */
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const category = String(request.input('category', '') || '').trim()
    const year = String(request.input('year', '') || '').trim()
    const q = String(request.input('q', '') || '').trim()

    // Categorias ativas de Acesso à Informação (com grupo) + contagem por slug.
    const [categories, countRows] = await Promise.all([
      SystemCategory.query()
        .where('type', 'information_record')
        .where('is_active', true)
        .orderBy('display_order', 'asc')
        .orderBy('name', 'asc'),
      db
        .from('information_records')
        .whereNull('deleted_at')
        .select('category')
        .count('* as total')
        .groupBy('category'),
    ])
    const countBySlug = new Map<string, number>(
      countRows.map((r: any) => [String(r.category), Number(r.total)])
    )

    const categoryList = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      grupo: c.grupo,
      count: countBySlug.get(c.slug) ?? 0,
    }))

    const totalCategories = categoryList.length
    const filledCategories = categoryList.filter((c) => c.count > 0).length
    const emptyCategories = totalCategories - filledCategories
    const progress =
      totalCategories > 0 ? Math.round((filledCategories / totalCategories) * 100) : 0

    let records: any[] | null = null
    let recordsMeta: any = null
    let selectedCategory: {
      id: number | null
      name: string
      slug: string
      grupo: string | null
      count: number
    } | null = null
    let years: number[] = []

    if (category) {
      const found = categoryList.find((c) => c.slug === category)
      selectedCategory = found
        ? { ...found }
        : {
            id: null,
            name: category,
            slug: category,
            grupo: null,
            count: countBySlug.get(category) ?? 0,
          }

      const yearRows = await db
        .from('information_records')
        .where('category', category)
        .whereNull('deleted_at')
        .distinct('year')
        .orderBy('year', 'desc')
      years = yearRows.map((r: any) => Number(r.year)).filter(Boolean)

      let query = InformationRecord.query()
        .where('category', category)
        .whereNull('deleted_at')
        .orderBy('year', 'desc')
        .orderBy('created_at', 'desc')
      if (year) query = query.where('year', year)
      if (q) {
        query = query.where((builder) => {
          builder.whereILike('title', `%${q}%`).orWhereILike('content', `%${q}%`)
        })
      }
      const paginated = await query.paginate(page, 20)
      const serialized = paginated.serialize()
      records = serialized.data as any
      recordsMeta = serialized.meta
    }

    return inertia.render('admin/information-records/index', {
      categories: categoryList,
      stats: { totalCategories, filledCategories, emptyCategories, progress },
      selectedCategory,
      records: records ? { data: records, meta: recordsMeta } : null,
      years,
      filters: { category, year, q },
    })
  }

  async create({ inertia, request }: HttpContext) {
    const categories = await SystemCategory.byType('information_record')
    // Pré-seleciona a categoria quando vem da listagem filtrada (?category=slug).
    const defaultCategory = String(request.input('category', '') || '').trim() || null
    return inertia.render('admin/information-records/form', {
      record: null,
      categories: categories.map((c) => c.serialize()),
      defaultCategory,
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title',
      'category',
      'year',
      'content',
      'reference_date',
      'open_mode',
      'hide_chrome',
    ])

    let fileUrl: string | null = null
    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      await assertSafeUpload(file, ['pdf'])
      const uploadDir = join(app.publicPath(), 'uploads', 'acesso-informacao')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `info-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      fileUrl = `/uploads/acesso-informacao/${fileName}`
    }

    await InformationRecord.create({
      title: data.title,
      category: data.category,
      year: Number.parseInt(data.year),
      content: sanitizeRichHtml(data.content) || null,
      referenceDate: data.reference_date || null,
      fileUrl,
      isActive: true,
      openMode: data.open_mode === 'modal' ? 'modal' : 'nova_aba',
      // Formulário envia via FormData: booleanos chegam como '1'/'0'
      hideChrome: !(data.hide_chrome === 'false' || data.hide_chrome === false || data.hide_chrome === '0'),
    })

    session.flash('success', 'Registro cadastrado com sucesso!')
    return response.redirect().toPath(categoryPath(data.category))
  }

  async edit({ params, inertia }: HttpContext) {
    const record = await InformationRecord.findOrFail(params.id)
    const categories = await SystemCategory.byType('information_record')
    return inertia.render('admin/information-records/form', {
      record: record.serialize(),
      categories: categories.map((c) => c.serialize()),
      defaultCategory: record.category,
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const record = await InformationRecord.findOrFail(params.id)
    const data = request.only([
      'title',
      'category',
      'year',
      'content',
      'reference_date',
      'is_active',
      'open_mode',
      'hide_chrome',
    ])

    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      await assertSafeUpload(file, ['pdf'])
      const uploadDir = join(app.publicPath(), 'uploads', 'acesso-informacao')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `info-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      record.fileUrl = `/uploads/acesso-informacao/${fileName}`
    }

    record.merge({
      title: data.title,
      category: data.category,
      year: Number.parseInt(data.year),
      content: sanitizeRichHtml(data.content) || null,
      referenceDate: data.reference_date || null,
      isActive: data.is_active === 'true' || data.is_active === true || data.is_active === '1',
      openMode: data.open_mode === 'modal' ? 'modal' : 'nova_aba',
      // Formulário envia via FormData: booleanos chegam como '1'/'0'
      hideChrome: !(data.hide_chrome === 'false' || data.hide_chrome === false || data.hide_chrome === '0'),
    })
    await record.save()

    session.flash('success', 'Registro atualizado com sucesso!')
    return response.redirect().toPath(categoryPath(record.category))
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session } = ctx
    const record = await InformationRecord.findOrFail(params.id)
    const category = record.category
    await TrashService.moveToTrash(record, ctx, {
      displayName: record.title,
      resource: 'acesso_informacao',
      metadata: { category },
    })
    session.flash('success', 'Registro movido para a lixeira.')
    return response.redirect().toPath(categoryPath(category))
  }
}

/** Volta para a listagem da categoria (visão geral quando não há categoria). */
function categoryPath(category?: string | null): string {
  const slug = String(category ?? '').trim()
  return slug
    ? `/painel/acesso-informacao?category=${encodeURIComponent(slug)}`
    : '/painel/acesso-informacao'
}
