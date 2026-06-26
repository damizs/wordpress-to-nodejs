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
}

export default GetPublicService
