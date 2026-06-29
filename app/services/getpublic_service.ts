/**
 * Cliente da API REST oficial do GetPublic (getpublic.inf.br/api/v1).
 *
 * A partir de jun/2026 o GetPublic expõe uma API REST autenticada por API key
 * (uma por entidade — Sumé = CMSU). Substitui o scraping antigo do
 * `diarios_serverside.php`. Documentação consumida em
 * `docs/integracoes/getpublic-o-que-precisamos.md`.
 *
 * Endpoints usados:
 *  - GET /entidades/CMSU/materias  → lista TODAS, paginada (tipo, q, atualizado_desde…)
 *  - GET /entidades/CMSU/diarios   → edições do Diário
 *  - GET /entidades/CMSU/tipos     → catálogo de tipos
 *  - GET /materias/{codigo}        → detalhe + `texto` extraído (p/ IA)
 *
 * A chave vem de env `GETPUBLIC_API_KEY` (configurar no Coolify). Os documentos
 * NÃO são armazenados: guardamos metadados + o link do visualizador/PDF.
 */
import env from '#start/env'

const BASE = 'https://getpublic.inf.br'
const API = `${BASE}/api/v1`
const ENTITY = 'CMSU'

export interface GetPublicMateria {
  codigo: string
  titulo: string
  tipo: string // rótulo de exibição (tipo_label) — ex.: "EXTRATO DE CONTRATO"
  tipoSlug: string // slug estável — ex.: "extrato_de_contrato"
  tipoGrupo: string | null
  numero: string | null
  urlMateria: string // visualizador (página HTML)
  urlDocumento: string | null // PDF direto
  diarioCodigo: string | null
  diarioData: string | null // ISO YYYY-MM-DD
  atualizadoEm: string | null
}

export interface GetPublicMateriaDetail extends GetPublicMateria {
  texto: string | null // texto extraído (OCR/PDF) — usado pela extração por IA
  anexos: Array<{ titulo?: string; url?: string; mime?: string }>
}

export interface GetPublicDiario {
  codigo: string
  titulo: string
  data: string | null
  urlDocumento: string | null
}

function apiKey(): string {
  const k = env.get('GETPUBLIC_API_KEY')
  if (!k) throw new Error('GETPUBLIC_API_KEY não configurada (Coolify env).')
  return k as string
}

function mapMateria(m: any): GetPublicMateria {
  return {
    codigo: String(m.codigo ?? ''),
    titulo: String(m.titulo ?? '').trim(),
    tipo: String(m.tipo_label ?? m.tipo ?? '').trim(),
    tipoSlug: String(m.tipo ?? '').trim(),
    tipoGrupo: m.tipo_grupo ?? null,
    numero: m.numero ?? null,
    urlMateria:
      m.url_visualizador ||
      `${BASE}/system/visualizar-materia?materia=${m.codigo}&link=${ENTITY}`,
    urlDocumento: m.url_documento ?? null,
    diarioCodigo: m.diario_edicao ?? null,
    diarioData: m.data_publicacao ?? null,
    atualizadoEm: m.atualizado_em ?? null,
  }
}

export class GetPublicService {
  static materiaViewerUrl(codigo: string): string {
    return `${BASE}/system/visualizar-materia?materia=${codigo}&link=${ENTITY}`
  }

  private async get(path: string): Promise<any> {
    // Timeout defensivo: a sincronização não pode pendurar o processo se a API
    // externa ficar lenta/indisponível (ver bug de boot travado).
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 15000)
    try {
      const res = await fetch(`${API}${path}`, {
        headers: { Authorization: `Bearer ${apiKey()}`, Accept: 'application/json' },
        signal: ctrl.signal,
      })
      if (!res.ok) throw new Error(`GetPublic API ${res.status} em ${path}`)
      return await res.json()
    } finally {
      clearTimeout(timer)
    }
  }

  /** Uma página de matérias (filtros opcionais). */
  async listMaterias(opts: {
    tipo?: string
    q?: string
    atualizadoDesde?: string
    page?: number
    perPage?: number
  } = {}): Promise<{ data: GetPublicMateria[]; meta: any }> {
    const p = new URLSearchParams()
    if (opts.tipo) p.set('tipo', opts.tipo)
    if (opts.q) p.set('q', opts.q)
    if (opts.atualizadoDesde) p.set('atualizado_desde', opts.atualizadoDesde)
    p.set('page', String(opts.page ?? 1))
    p.set('per_page', String(opts.perPage ?? 100))
    const json = await this.get(`/entidades/${ENTITY}/materias?${p.toString()}`)
    return { data: (json?.data ?? []).map(mapMateria), meta: json?.meta ?? {} }
  }

  /** Todas as matérias (itera páginas). Suporta sync incremental via atualizadoDesde. */
  async listAllMaterias(
    opts: { tipo?: string; atualizadoDesde?: string; perPage?: number } = {}
  ): Promise<GetPublicMateria[]> {
    const perPage = opts.perPage ?? 200
    const all: GetPublicMateria[] = []
    let page = 1
    // total_pages limita o loop; guarda extra contra resposta sem meta.
    for (let guard = 0; guard < 1000; guard++) {
      const { data, meta } = await this.listMaterias({ ...opts, page, perPage })
      all.push(...data)
      const totalPages = Number(meta?.total_pages ?? 1)
      if (!data.length || page >= totalPages) break
      page++
    }
    return all
  }

  /** Detalhe de uma matéria, incluindo o texto extraído (p/ extração por IA). */
  async getMateria(codigo: string): Promise<GetPublicMateriaDetail> {
    const json = await this.get(`/materias/${codigo}`)
    const d = json?.data ?? json
    return { ...mapMateria(d), texto: d.texto ?? null, anexos: d.anexos ?? [] }
  }

  /** Edições do Diário Oficial. */
  async listDiarios(): Promise<GetPublicDiario[]> {
    const json = await this.get(`/entidades/${ENTITY}/diarios?per_page=2000`)
    return (json?.data ?? []).map((d: any) => ({
      codigo: String(d.codigo ?? d.edicao ?? ''),
      titulo: String(d.titulo ?? ''),
      data: d.data_publicacao ?? d.data ?? null,
      urlDocumento: d.url_documento ?? null,
    }))
  }

  /** Catálogo de tipos (slug/label/grupo). */
  async listTipos(): Promise<Array<{ slug: string; label: string; grupo: string }>> {
    const json = await this.get(`/entidades/${ENTITY}/tipos`)
    return (json?.data ?? json ?? []).map((t: any) => ({
      slug: t.slug,
      label: t.label,
      grupo: t.grupo,
    }))
  }

  /**
   * Sincroniza TODAS as matérias do GetPublic para o banco — em DUAS tabelas:
   *  - `getpublic_materias`: índice para a busca global (sem armazenar PDFs).
   *  - `official_gazette_entries`: fonte da página pública do Diário Oficial.
   *    Upsert por `edition_number = codigo`; `file_url` recebe o PDF direto
   *    (`url_documento`) para embeber no modal; data/título do GetPublic.
   * Idempotente (upsert) — não apaga registros existentes (ex.: importados do WP).
   * Reusado pelo comando `getpublic:sync` e pelo agendador diário.
   */
  async syncAll(): Promise<{ total: number; materiasNew: number; gazetteNew: number }> {
    const { DateTime } = await import('luxon')
    const { default: GetPublicMateria } = await import('#models/getpublic_materia')
    const { default: OfficialGazetteEntry } = await import('#models/official_gazette_entry')

    const materias = await this.listAllMaterias()
    const now = DateTime.now()
    let materiasNew = 0
    let gazetteNew = 0

    for (const m of materias) {
      if (!m.codigo) continue

      // 1) índice de busca
      const idx = await GetPublicMateria.findBy('codigo', m.codigo)
      const idxPayload = {
        codigo: m.codigo,
        titulo: m.titulo.slice(0, 600),
        tipo: (m.tipo || '').slice(0, 120),
        diarioCodigo: m.diarioCodigo || null,
        diarioData: m.diarioData ? DateTime.fromISO(m.diarioData) : null,
        urlMateria: m.urlMateria.slice(0, 500),
        syncedAt: now,
      }
      if (idx) {
        idx.merge(idxPayload)
        await idx.save()
      } else {
        await GetPublicMateria.create(idxPayload)
        materiasNew++
      }

      // 2) Diário Oficial público (fonte da página /diario-oficial)
      const pubDate = m.diarioData || (m.atualizadoEm ? m.atualizadoEm.slice(0, 10) : null)
      const gaz = await OfficialGazetteEntry.query().where('edition_number', m.codigo).first()
      // PDF direto (embebível no modal); cai para o visualizador se faltar.
      const fileUrl = m.urlDocumento || m.urlMateria
      if (gaz) {
        gaz.merge({
          description: m.titulo,
          fileUrl,
          ...(pubDate ? { publicationDate: pubDate } : {}),
        })
        await gaz.save()
      } else if (pubDate) {
        await OfficialGazetteEntry.create({
          editionNumber: m.codigo,
          publicationDate: pubDate,
          description: m.titulo,
          fileUrl,
        })
        gazetteNew++
      }
    }

    // 3) EDIÇÕES DIÁRIAS do Diário Oficial (o "jornal do dia") — vão até hoje,
    // enquanto as matérias individuais podem parar antes. Sem elas, o calendário
    // do Diário ficava preso no mês da última matéria. Upsert por edition_number.
    let diariosNew = 0
    try {
      const diarios = await this.listDiarios()
      for (const d of diarios) {
        if (!d.codigo || !d.data) continue
        const fileUrl = d.urlDocumento || GetPublicService.materiaViewerUrl(d.codigo)
        const existing = await OfficialGazetteEntry.query()
          .where('edition_number', d.codigo)
          .first()
        if (existing) {
          existing.merge({
            description: d.titulo || existing.description,
            fileUrl,
            publicationDate: d.data,
          })
          await existing.save()
        } else {
          await OfficialGazetteEntry.create({
            editionNumber: d.codigo,
            publicationDate: d.data,
            description: d.titulo || `Diário Oficial - Edição ${d.codigo}`,
            fileUrl,
          })
          diariosNew++
        }
      }
    } catch (err) {
      // Não derruba o sync das matérias se o endpoint de diários falhar.
      console.error('[GetPublic] sync de edições diárias falhou:', (err as Error)?.message)
    }

    return { total: materias.length, materiasNew, gazetteNew: gazetteNew + diariosNew }
  }
}

export default GetPublicService
