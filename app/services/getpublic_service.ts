/**
 * Cliente da "API" do GetPublic (getpublic.inf.br) para a entidade da Câmara.
 *
 * O GetPublic não expõe uma API REST documentada; expõe o backend DataTables
 * server-side `diarios_serverside.php`, que — com uma sessão válida e o flag
 * `buscaConteudo=true` — busca no CONTEÚDO/OCR dos diários e devolve, por edição,
 * as MATÉRIAS individuais que casam (código de 14 dígitos, título, tipo e link do
 * visualizador). Decifrado em jun/2026.
 *
 * Fluxo:
 *  1. bootstrapSession(): GET /system/materias?link=CMSU → PHPSESSID (cookie).
 *  2. search(term): POST diarios_serverside.php (cookie + Referer + buscaConteudo)
 *     → diários filtrados + matérias achatadas.
 *  3. listAllMaterias(): união de buscas por vogais → catálogo completo (~todas as
 *     matérias contêm alguma vogal), deduplicado por código.
 *
 * Os documentos NÃO são baixados/armazenados: guardamos só os metadados + o link
 * do visualizador (o PDF vive no GetPublic). Basta buscar e encontrar.
 */

const BASE = 'https://getpublic.inf.br'
const ENTITY = 'CMSU'
const SERVERSIDE = `${BASE}/system/diarios_serverside.php`
const LIST_PAGE = `${BASE}/system/materias?link=${ENTITY}`

export interface GetPublicMateria {
  codigo: string // 14 dígitos, estável (chave de upsert)
  titulo: string
  tipo: string // PORTARIA, AVISO DE LICITAÇÃO, EXTRATO DE CONTRATO, ATA, REQUERIMENTO...
  urlMateria: string // link absoluto do visualizador
  diarioCodigo: string // edição do diário que contém a matéria (ex.: "00310")
  diarioData: string | null // ISO YYYY-MM-DD
}

export interface GetPublicDiario {
  codigo: string
  titulo: string
  data: string | null // ISO YYYY-MM-DD
  arquivo: string | null
  pdfUrl: string | null
}

function brToIso(br: string | null | undefined): string | null {
  if (!br) return null
  const m = String(br).match(/(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

export class GetPublicService {
  private cookies = ''

  /** Visualizador público da matéria (página HTML — abre em nova aba). */
  static materiaViewerUrl(codigo: string): string {
    return `${BASE}/system/visualizar-materia?materia=${codigo}&link=${ENTITY}`
  }
  /** PDF direto da matéria (sem armazenar nada localmente). */
  static materiaPdfUrl(codigo: string): string {
    return `${BASE}/uploads/${ENTITY}/pdf/${codigo}/getpub-view.pdf`
  }
  /** PDF direto da edição do diário. */
  static diarioPdfUrl(arquivo: string): string {
    return `${BASE}/uploads/${ENTITY}/diario/${encodeURIComponent(arquivo)}`
  }

  /** Obtém PHPSESSID visitando a página de listagem. Necessário p/ buscaConteudo. */
  async bootstrapSession(): Promise<void> {
    const res = await fetch(LIST_PAGE, { method: 'GET', redirect: 'manual' })
    const set = (res.headers as any).getSetCookie?.() as string[] | undefined
    const raw = set && set.length ? set : [res.headers.get('set-cookie') || '']
    // Mantém o último valor por chave e descarta cookies expirados (`=deleted`),
    // como faz um cookie jar — o GetPublic emite `link=deleted` antes de `link=CMSU`.
    const jar = new Map<string, string>()
    for (const c of raw.filter(Boolean)) {
      const pair = c.split(';')[0]
      const eq = pair.indexOf('=')
      if (eq < 0) continue
      const key = pair.slice(0, eq).trim()
      const value = pair.slice(eq + 1).trim()
      if (!key || value === 'deleted' || value === '') {
        jar.delete(key)
        continue
      }
      jar.set(key, value)
    }
    this.cookies = [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
    if (!this.cookies.includes('PHPSESSID')) {
      throw new Error('GetPublic: falha ao obter sessão (PHPSESSID ausente)')
    }
  }

  private buildBody(term: string, start: number, length: number): URLSearchParams {
    const b = new URLSearchParams()
    b.set('link', ENTITY)
    b.set('draw', '1')
    b.set('start', String(start))
    b.set('length', String(length))
    b.set('search[value]', term)
    b.set('search[regex]', 'false')
    b.set('buscaConteudo', 'true')
    return b
  }

  /**
   * Busca matérias por termo (conteúdo/OCR). Retorna diários filtrados e as
   * matérias achatadas (com a edição/data de origem).
   */
  async search(
    term: string,
    opts: { length?: number } = {}
  ): Promise<{ diarios: GetPublicDiario[]; materias: GetPublicMateria[] }> {
    if (!this.cookies) await this.bootstrapSession()
    const length = opts.length ?? 1000
    const res = await fetch(SERVERSIDE, {
      method: 'POST',
      redirect: 'manual',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': this.cookies,
        'Referer': LIST_PAGE,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: this.buildBody(term, 0, length).toString(),
    })
    if (!res.ok) throw new Error(`GetPublic serverside HTTP ${res.status}`)
    const json: any = await res.json()
    const diarios: GetPublicDiario[] = []
    const materias: GetPublicMateria[] = []
    for (const row of json?.data ?? []) {
      const dCodigo = String(row.codigo ?? '')
      const dData = brToIso(row.dataBr)
      diarios.push({
        codigo: dCodigo,
        titulo: String(row.titulo ?? ''),
        data: dData,
        arquivo: row.arquivo ?? null,
        pdfUrl: row.arquivo ? GetPublicService.diarioPdfUrl(row.arquivo) : null,
      })
      for (const m of row.materiasMatch ?? []) {
        const codigo = String(m.codigo ?? '')
        if (!/^\d{14}$/.test(codigo)) continue
        materias.push({
          codigo,
          titulo: String(m.titulo ?? '').trim(),
          tipo: String(m.tipo ?? '').trim(),
          urlMateria: m.urlMateria
            ? `${BASE}${m.urlMateria}`
            : GetPublicService.materiaViewerUrl(codigo),
          diarioCodigo: dCodigo,
          diarioData: dData,
        })
      }
    }
    return { diarios, materias }
  }

  /** Lista todas as edições do diário (sem busca de conteúdo). */
  async listDiarios(): Promise<GetPublicDiario[]> {
    const { diarios } = await this.search('', { length: 2000 })
    return diarios
  }

  /**
   * Catálogo completo de matérias: une buscas por vogais (quase toda matéria
   * contém alguma) e deduplica por código. Estratégia robusta de enumeração já
   * que o backend só devolve matérias quando há termo de conteúdo.
   */
  async listAllMaterias(terms: string[] = ['a', 'e', 'o', 'i', 'u']): Promise<GetPublicMateria[]> {
    const byCodigo = new Map<string, GetPublicMateria>()
    for (const t of terms) {
      const { materias } = await this.search(t, { length: 2000 })
      for (const m of materias) if (!byCodigo.has(m.codigo)) byCodigo.set(m.codigo, m)
    }
    return [...byCodigo.values()]
  }
}

export default GetPublicService
