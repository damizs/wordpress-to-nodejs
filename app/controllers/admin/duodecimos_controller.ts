import type { HttpContext } from '@adonisjs/core/http'
import Duodecimo from '#models/duodecimo'
import { normalizeSafeWebUrl } from '#helpers/safe_url'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { assertSafeUpload } from '#helpers/upload_security'

/** Normaliza valor monetário ("1.234,56" ou "1234.56") para number */
function parseMoney(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'number') return raw
  const cleaned = String(raw).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
  const n = Number.parseFloat(cleaned)
  return Number.isNaN(n) ? null : n
}

export default class DuodecimosController {
  async index({ inertia, request }: HttpContext) {
    const yearRows = await Duodecimo.query().distinct('year').orderBy('year', 'desc')
    const years = yearRows.map((r) => r.year)

    const requested = Number.parseInt(request.input('ano', ''))
    const selectedYear =
      requested && years.includes(requested) ? requested : (years[0] ?? new Date().getFullYear())

    const records = await Duodecimo.query().where('year', selectedYear).orderBy('month', 'asc')

    return inertia.render('admin/duodecimos/index', {
      records: records.map((d) => ({
        id: d.id,
        year: d.year,
        month: d.month,
        previsto: d.previsto ?? 0,
        recebido: d.recebido,
        repasseDate: d.repasseDate,
        documentUrl: d.documentUrl,
        notes: d.notes,
      })),
      years,
      selectedYear,
    })
  }

  async store({ request, response, session }: HttpContext) {
    const year = Number.parseInt(request.input('year'))
    const month = Number.parseInt(request.input('month'))
    const previsto = parseMoney(request.input('previsto')) ?? 0

    if (!year || !month || month < 1 || month > 12 || previsto < 0) {
      session.flash('error', 'Dados inválidos. Verifique ano, mês (1 a 12) e o valor previsto.')
      return response.redirect().back()
    }

    const duodecimo = await Duodecimo.updateOrCreate(
      { year, month },
      {
        year,
        month,
        previsto,
        recebido: parseMoney(request.input('recebido')),
        repasseDate: request.input('repasse_date') || null,
        documentUrl: normalizeSafeWebUrl(request.input('document_url')),
        notes: request.input('notes') || null,
      }
    )
    await this.saveDocument(request, duodecimo)

    session.flash('success', 'Lançamento salvo com sucesso!')
    return response.redirect().toPath(`/painel/duodecimos?ano=${year}`)
  }

  async update({ params, request, response, session }: HttpContext) {
    const duodecimo = await Duodecimo.findOrFail(params.id)
    const previsto = parseMoney(request.input('previsto')) ?? 0

    if (previsto < 0) {
      session.flash('error', 'O valor previsto não pode ser negativo.')
      return response.redirect().back()
    }

    duodecimo.merge({
      previsto,
      recebido: parseMoney(request.input('recebido')),
      repasseDate: request.input('repasse_date') || null,
      notes: request.input('notes') || null,
    })
    // URL externa opcional só substitui quando informada; sem URL nem arquivo
    // novo, o documento atual é preservado.
    const externalUrl = normalizeSafeWebUrl(request.input('document_url'))
    if (externalUrl) duodecimo.documentUrl = externalUrl
    // Upload de arquivo novo (request.file('document_file')) tem prioridade.
    await this.saveDocument(request, duodecimo)
    await duodecimo.save()

    session.flash('success', 'Lançamento atualizado!')
    return response.redirect().toPath(`/painel/duodecimos?ano=${duodecimo.year}`)
  }

  async destroy({ params, response, session }: HttpContext) {
    const duodecimo = await Duodecimo.findOrFail(params.id)
    await duodecimo.delete()
    session.flash('success', 'Lançamento excluído!')
    return response.redirect().toPath(`/painel/duodecimos?ano=${duodecimo.year}`)
  }

  /** Cria (ou completa) os 12 meses de um ano. Previsto opcional, replicado em todos os meses. */
  async generateYear({ request, response, session }: HttpContext) {
    const year = Number.parseInt(request.input('year'))
    const previstoMensal = parseMoney(request.input('previsto')) ?? 0

    if (!year || year < 1900 || year > 2200 || previstoMensal < 0) {
      session.flash('error', 'Informe um ano válido e um valor previsto não negativo.')
      return response.redirect().back()
    }

    for (let month = 1; month <= 12; month++) {
      // Não sobrescreve recebido/data já lançados: cria só o que falta e
      // atualiza apenas o previsto.
      const existing = await Duodecimo.query().where({ year, month }).first()
      if (existing) {
        existing.previsto = previstoMensal
        await existing.save()
      } else {
        await Duodecimo.create({ year, month, previsto: previstoMensal })
      }
    }

    session.flash('success', `Os 12 meses de ${year} foram gerados.`)
    return response.redirect().toPath(`/painel/duodecimos?ano=${year}`)
  }

  private async saveDocument(request: HttpContext['request'], duodecimo: Duodecimo) {
    const file = request.file('document_file', { size: '30mb', extnames: ['pdf'] })
    if (!file) return

    await assertSafeUpload(file, ['pdf'])
    const uploadDir = join(app.publicPath(), 'uploads', 'duodecimos')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

    const fileName = `duodecimo-${duodecimo.year}-${duodecimo.month}-${cuid()}.${file.extname}`
    await file.move(uploadDir, { name: fileName })
    if (file.state === 'moved') {
      duodecimo.documentUrl = `/uploads/duodecimos/${fileName}`
      await duodecimo.save()
    }
  }
}
