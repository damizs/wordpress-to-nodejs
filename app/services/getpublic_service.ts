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
import { camara } from '#config/camara'
import {
  extractGetPublicContractFields,
  getpublicSourceTag,
  getpublicSlug,
  licitacaoPayload,
  officialPublicationPayload,
  routeGetPublicMateria,
} from '#helpers/getpublic_import'

const BASE = 'https://getpublic.inf.br'
const API = `${BASE}/api/v1`
// Código da entidade no GetPublic (Sumé = CMSU). Parametrizado via config/camara
// (env GETPUBLIC_ENTITY). Em câmaras novas, configure explicitamente para evitar
// sincronizar acervo de outra entidade.
const ENTITY = camara.getpublicEntity

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
  if (!ENTITY) throw new Error('GETPUBLIC_ENTITY não configurada (Coolify env).')
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
   * Sincroniza o GetPublic sem misturar os acervos:
   *  - `getpublic_materias`: índice de busca global;
   *  - matérias de contratação/licitação/publicação → módulos nativos;
   *  - `official_gazette_entries`: somente edições diárias do Diário Oficial.
   *
   * Idempotente por código/slug GetPublic. Não apaga registros existentes.
   */
  async syncAll(): Promise<{
    total: number
    materiasNew: number
    licitacoesNew: number
    contractsNew: number
    contractsUpdated: number
    publicationsNew: number
    diariosNew: number
    gazetteNew: number
  }> {
    const { DateTime } = await import('luxon')
    const { default: GetPublicMateria } = await import('#models/getpublic_materia')
    const { default: OfficialGazetteEntry } = await import('#models/official_gazette_entry')
    const { default: Licitacao } = await import('#models/licitacao')
    const { default: LicitacaoDocument } = await import('#models/licitacao_document')
    const { default: Contract } = await import('#models/contract')
    const { default: OfficialPublication } = await import('#models/official_publication')

    const materias = await this.listAllMaterias()
    const now = DateTime.now()
    let materiasNew = 0
    let licitacoesNew = 0
    let contractsNew = 0
    let contractsUpdated = 0
    let publicationsNew = 0

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

      // 2) Módulos nativos: publicações, licitações e contratos/fiscais.
      // Matérias individuais não entram mais em official_gazette_entries.
      const route = routeGetPublicMateria(m)

      if (route.target === 'licitacao') {
        const payload = licitacaoPayload(m, route.modality)
        let licitacao = await Licitacao.findBy('slug', payload.slug)
        if (licitacao) {
          licitacao.merge(payload)
          await licitacao.save()
        } else {
          licitacao = await Licitacao.create(payload)
          licitacoesNew++
        }

        const docExists = await LicitacaoDocument.query()
          .where('licitacao_id', licitacao.id)
          .where('file_url', route.fileUrl)
          .first()
        if (!docExists && route.fileUrl) {
          await LicitacaoDocument.create({
            licitacaoId: licitacao.id,
            documentType: route.modality.toLowerCase().includes('contrato') ? 'contrato' : 'outros',
            title: m.titulo.slice(0, 255),
            fileUrl: route.fileUrl,
            displayOrder: 0,
          })
        }
        continue
      }

      if (route.target === 'publication') {
        const payload = officialPublicationPayload(m, route.type)
        const publication = await OfficialPublication.findBy('slug', payload.slug)
        if (publication) {
          publication.merge(payload)
          await publication.save()
        } else {
          await OfficialPublication.create(payload)
          publicationsNew++
        }
        continue
      }

      if (route.target === 'contract') {
        let detail: GetPublicMateriaDetail | null = null
        try {
          detail = await this.getMateria(m.codigo)
        } catch {
          detail = { ...m, texto: null, anexos: [] }
        }

        const extracted = extractGetPublicContractFields(detail)
        const number = extracted.number || m.numero || m.codigo
        if (route.kind === 'fiscal' && !extracted.number) {
          continue
        }
        const year =
          extracted.year ||
          Number.parseInt((m.diarioData || m.atualizadoEm || '').slice(0, 4), 10) ||
          new Date().getFullYear()
        const tag = getpublicSourceTag(m.codigo)
        const sourceNote = `${tag} Importado automaticamente do GetPublic. Revisar campos estruturados no painel.`

        const contractBySlug = await Contract.findBy('slug', getpublicSlug('getpublic-contrato', m))
        const contractByNumber =
          !contractBySlug && number
            ? await Contract.query().where('number', number).where('year', year).first()
            : null
        const contract = contractBySlug || contractByNumber

        const payload = {
          number,
          year,
          slug: contract?.slug || getpublicSlug('getpublic-contrato', m),
          object: extracted.object || m.titulo,
          contractorName: extracted.contractorName,
          contractorDocument: extracted.contractorDocument,
          value: extracted.value,
          modality: extracted.modality,
          legalBasis: extracted.legalBasis,
          signDate: extracted.signDate,
          startDate: extracted.startDate,
          endDate: extracted.endDate,
          term: extracted.term,
          status: route.kind === 'amendment' ? 'vigente' : extracted.status,
          managerName: extracted.managerName,
          managerRole: extracted.managerRole,
          fiscalName: extracted.fiscalName,
          fiscalRole: extracted.fiscalRole,
          fiscalAct: extracted.fiscalAct,
          fileUrl: route.fileUrl,
          content: extracted.content,
          notes: sourceNote,
          isActive: true,
          displayOrder: 0,
        }

        if (contract) {
          contract.merge({
            ...payload,
            // Não sobrescreve campos humanos já preenchidos com null do parser.
            contractorName: payload.contractorName || contract.contractorName,
            contractorDocument: payload.contractorDocument || contract.contractorDocument,
            value: payload.value ?? contract.value,
            managerName: payload.managerName || contract.managerName,
            managerRole: payload.managerRole || contract.managerRole,
            fiscalName: payload.fiscalName || contract.fiscalName,
            fiscalRole: payload.fiscalRole || contract.fiscalRole,
            fiscalAct: payload.fiscalAct || contract.fiscalAct,
            notes: contract.notes?.includes(tag)
              ? contract.notes
              : [contract.notes, sourceNote].filter(Boolean).join('\n'),
          })
          await contract.save()
          contractsUpdated++
        } else {
          await Contract.create(payload)
          contractsNew++
        }
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

    return {
      total: materias.length,
      materiasNew,
      licitacoesNew,
      contractsNew,
      contractsUpdated,
      publicationsNew,
      diariosNew,
      gazetteNew: diariosNew,
    }
  }
}

export default GetPublicService
