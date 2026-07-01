import { generateSlug } from '#helpers/slug'
import { routeMateria } from '#helpers/materia_router'

export interface GetPublicMateriaLike {
  codigo: string
  titulo: string
  tipo: string
  tipoSlug?: string | null
  tipoGrupo?: string | null
  numero?: string | null
  urlMateria: string
  urlDocumento?: string | null
  diarioData?: string | null
  atualizadoEm?: string | null
}

export interface GetPublicMateriaDetailLike extends GetPublicMateriaLike {
  texto?: string | null
}

export type GetPublicNativeRoute =
  | { target: 'skip'; reason: 'diario' | 'invalid' }
  | { target: 'contract'; kind: 'contract' | 'fiscal' | 'amendment'; fileUrl: string }
  | { target: 'licitacao'; modality: string; fileUrl: string }
  | { target: 'publication'; type: string; fileUrl: string }

export interface ExtractedContractFields {
  number: string | null
  year: number | null
  object: string | null
  contractorName: string | null
  contractorDocument: string | null
  value: number | null
  modality: string | null
  legalBasis: string | null
  signDate: string | null
  startDate: string | null
  endDate: string | null
  term: string | null
  managerName: string | null
  managerRole: string | null
  fiscalName: string | null
  fiscalRole: string | null
  fiscalAct: string | null
  content: string | null
  status: 'vigente' | 'encerrado'
}

const CONTRACT_RE =
  /\b(extrato\s+de\s+contrato|contrato\s+n|contrato\s+administrativo|termo\s+aditivo|extrato\s+de\s+aditivo|distrato|apostilamento)\b/i
const CONTRACT_FISCAL_RE =
  /\b(fiscal(?:\s+(?:do|de)\s+contrato)?|gestor(?:\s+(?:do|de)\s+contrato)?|designa(?:r|cao|ção)?\s+.*fiscal)\b/i
const AMENDMENT_RE = /\b(aditivo|apostilamento|distrato)\b/i
const DIARIO_RE = /\b(di[aá]rio\s+oficial|edi[cç][aã]o\s+(?:do\s+)?di[aá]rio)\b/i

function compactText(value: string | null | undefined): string {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function haystack(m: GetPublicMateriaLike): string {
  return `${m.tipo || ''} ${m.tipoSlug || ''} ${m.tipoGrupo || ''} ${m.titulo || ''}`
}

function typeAndTitle(m: GetPublicMateriaLike): string {
  return `${m.tipo || ''} ${m.tipoSlug || ''} ${m.titulo || ''}`
}

function fileUrl(m: GetPublicMateriaLike): string {
  return m.urlDocumento || m.urlMateria
}

function cleanNumber(value: string | null | undefined): string | null {
  const n = compactText(value)
    .replace(/^n[ºo.°]\s*/i, '')
    .replace(/\s*-\s*/g, '-')
  if (!n || /^\d{14}$/.test(n)) return null
  return n.slice(0, 50)
}

function dateYear(m: GetPublicMateriaLike): number | null {
  const raw = m.diarioData || m.atualizadoEm || ''
  const year = Number.parseInt(raw.slice(0, 4), 10)
  return Number.isFinite(year) ? year : null
}

function publicationType(m: GetPublicMateriaLike): string {
  const text = haystack(m).toLowerCase()
  if (text.includes('portaria')) return 'Portaria'
  if (text.includes('decreto')) return 'Decreto'
  if (text.includes('resolu')) return 'Resolução'
  if (text.includes('edital')) return 'Edital'
  if (text.includes('ata')) return 'Ata Administrativa'
  if (text.includes('lei')) return 'Lei'
  return 'Ato Administrativo'
}

export function getpublicSourceTag(codigo: string): string {
  return `[GETPUBLIC:${codigo}]`
}

export function getpublicSlug(prefix: string, m: GetPublicMateriaLike): string {
  return generateSlug(`${prefix}-${m.codigo || m.titulo}`).slice(0, 255)
}

export function routeGetPublicMateria(m: GetPublicMateriaLike): GetPublicNativeRoute {
  if (!m.codigo) return { target: 'skip', reason: 'invalid' }

  const text = haystack(m)
  const typeTitle = typeAndTitle(m)
  const url = fileUrl(m)
  const slug = String(m.tipoSlug || '').toLowerCase()

  if (slug === 'diario' || slug === 'diario_oficial' || DIARIO_RE.test(typeTitle)) {
    return { target: 'skip', reason: 'diario' }
  }

  if (CONTRACT_FISCAL_RE.test(text)) {
    return { target: 'contract', kind: 'fiscal', fileUrl: url }
  }

  if (CONTRACT_RE.test(text)) {
    return {
      target: 'contract',
      kind: AMENDMENT_RE.test(text) ? 'amendment' : 'contract',
      fileUrl: url,
    }
  }

  const routed = routeMateria({
    tipo: m.tipo,
    titulo: m.titulo,
    conteudo: m.urlMateria,
    codigo: m.codigo,
  })

  if (routed.target === 'licitacao') {
    return { target: 'licitacao', modality: routed.modality, fileUrl: url }
  }

  if (routed.target === 'skip') {
    return { target: 'skip', reason: 'invalid' }
  }

  return {
    target: 'publication',
    type: routed.type || publicationType(m),
    fileUrl: url,
  }
}

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    const value = compactText(match?.[1])
    if (value) return value.slice(0, 300)
  }
  return null
}

function personName(value: string | null): string | null {
  const name = compactText(value)
    .replace(/^(?:o|a|os|as)\s+/i, '')
    .replace(/^servidor(?:a)?\s+/i, '')
    .replace(/^servidor\(a\)\s+/i, '')
    .replace(/\s*,?\s*matr[ií]cula\b.*$/i, '')
    .replace(/\s+para\s+atuar\b.*$/i, '')
    .trim()
  return name ? name.slice(0, 300) : null
}

function firstDate(text: string, label: RegExp): string | null {
  const match = text.match(new RegExp(`${label.source}.{0,80}?(\\d{2}\\/\\d{2}\\/\\d{4})`, 'i'))
  if (!match?.[1]) return null
  const [day, month, year] = match[1].split('/')
  return `${year}-${month}-${day}`
}

function moneyValue(text: string): number | null {
  const match = text.match(/R\$\s*([\d.]+,\d{2})/)
  if (!match?.[1]) return null
  const value = Number.parseFloat(match[1].replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(value) ? value : null
}

function yearFromNumber(number: string | null): number | null {
  const year = Number.parseInt(number?.match(/\/(\d{4})\b/)?.[1] || '', 10)
  return Number.isFinite(year) ? year : null
}

function statusFromEndDate(endDate: string | null): 'vigente' | 'encerrado' {
  if (!endDate) return 'vigente'
  return endDate < new Date().toISOString().slice(0, 10) ? 'encerrado' : 'vigente'
}

export function extractGetPublicContractFields(
  m: GetPublicMateriaDetailLike
): ExtractedContractFields {
  const title = compactText(m.titulo)
  const body = compactText(m.texto)
  const text = `${title} ${body}`
  const sourceLooksLikeFiscal = CONTRACT_FISCAL_RE.test(typeAndTitle(m))

  const numberFromText = firstMatch(text, [
      /(?:contrato|contratual)\s*(?:administrativo)?\s*(?:n[ºo.°]*)?\s*([A-Z]{0,4}\s*\d{1,8}(?:[-.]\d+)?\/\d{4})/i,
      /(?:contrato|contratual)\s*(?:administrativo)?\s*(?:n[ºo.°]*)?\s*(\d{1,8}\/\d{4})/i,
      /\b([A-Z]{1,4}\d{3,8}(?:-\d+)?\/\d{4})\b/i,
    ])
  const number = numberFromText || (sourceLooksLikeFiscal ? null : cleanNumber(m.numero))

  const object =
    firstMatch(text, [
      /objeto\s*[:\-]\s*(.+?)(?=\s+(?:contratad[ao]|valor|vig[eê]ncia|fundamento|data\s+de\s+assinatura)\s*[:\-]|$)/i,
      /contrata[cç][aã]o\s+(.+?)(?=\s+(?:valor|vig[eê]ncia|contratad[ao])\s*[:\-]|$)/i,
    ]) || title

  const fiscalAct =
    firstMatch(text, [/portaria\s*(?:n[ºo.°]*)?\s*([A-Z0-9./-]{2,40})/i]) ||
    (sourceLooksLikeFiscal ? cleanNumber(m.numero) : null)

  const endDate = firstDate(text, /(?:fim|t[eé]rmino|encerramento|vig[eê]ncia\s+at[eé])/i)

  return {
    number,
    year: yearFromNumber(number) || dateYear(m),
    object,
    contractorName: firstMatch(text, [
      /contratad[ao]\s*[:\-]\s*([^;.\n]+?)(?=\s+(?:CNPJ|CPF|valor|objeto)\b|$)/i,
      /empresa\s+contratada\s*[:\-]\s*([^;.\n]+)/i,
    ]),
    contractorDocument:
      text.match(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/)?.[0] ||
      text.match(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/)?.[0] ||
      null,
    value: moneyValue(text),
    modality: firstMatch(text, [
      /(dispensa\s+de\s+licita[cç][aã]o)/i,
      /(inexigibilidade)/i,
      /(preg[aã]o\s+(?:eletr[oô]nico|presencial)?)/i,
      /(concorr[eê]ncia)/i,
    ]),
    legalBasis: firstMatch(text, [
      /fundamento\s+legal\s*[:\-]\s*([^;\n]+?)(?=\s+(?:valor|contratad[ao]|objeto)\b|$)/i,
      /(art\.\s*\d+[^;\n]{0,120}lei\s*n?[ºo.°]?\s*14\.133\/2021)/i,
    ]),
    signDate: firstDate(text, /assinatura/i),
    startDate: firstDate(text, /(?:in[ií]cio|vig[eê]ncia\s+a\s+partir)/i),
    endDate,
    term: firstMatch(text, [/vig[eê]ncia\s*[:\-]\s*([^;\n.]{3,120})/i]),
    managerName: personName(firstMatch(text, [
      /designa(?:r)?\s+(?:o|a|o\(a\))?\s*(?:servidor(?:a)?\s+)?([^;.\n]+?)\s*,?\s*(?:matr[ií]cula[^;.\n]+?)?\s+para\s+atuar\s+como\s+gestor/i,
      /gestor(?:\s+(?:do|de)\s+contrato)?\s*[:\-]\s*([^;.\n]+?)(?=\s+(?:cargo|matr[ií]cula|CPF)\b|$)/i,
    ])),
    managerRole: firstMatch(text, [/gestor[^;\n.]{0,120}\bcargo\s*[:\-]\s*([^;.\n]+)/i]),
    fiscalName: personName(firstMatch(text, [
      /designa(?:r)?\s+(?:o|a|o\(a\))?\s*(?:servidor(?:a)?\s+)?([^;.\n]+?)\s*,?\s*(?:matr[ií]cula[^;.\n]+?)?\s+para\s+atuar\s+como\s+fiscal/i,
      /fiscal(?:\s+titular)?(?:\s+(?:do|de)\s+contrato)?\s*[:\-]\s*([^;.\n]+?)(?=\s+(?:cargo|matr[ií]cula|CPF)\b|$)/i,
      /designa(?:r)?\s+(?:o\(a\)\s+)?(?:servidor\(a\)\s+)?([^;.\n]+?)\s+(?:para|como)\s+fiscal/i,
    ])),
    fiscalRole: firstMatch(text, [/fiscal[^;\n.]{0,120}\bcargo\s*[:\-]\s*([^;.\n]+)/i]),
    fiscalAct,
    content: body || null,
    status: statusFromEndDate(endDate),
  }
}

export function officialPublicationPayload(m: GetPublicMateriaLike, type?: string) {
  const publicationDate =
    m.diarioData || m.atualizadoEm?.slice(0, 10) || `${new Date().getFullYear()}-01-01`
  return {
    title: m.titulo.slice(0, 255),
    slug: getpublicSlug('getpublic-publicacao', m),
    type: type || publicationType(m),
    number: cleanNumber(m.numero) || m.codigo,
    publicationDate,
    description: null,
    fileUrl: fileUrl(m),
  }
}

export function licitacaoPayload(m: GetPublicMateriaLike, modality: string) {
  const publicationDate = m.diarioData || m.atualizadoEm?.slice(0, 10) || ''
  const year = Number.parseInt(publicationDate.slice(0, 4), 10) || new Date().getFullYear()
  return {
    title: m.titulo.slice(0, 500),
    slug: getpublicSlug('getpublic-licitacao', m),
    number: cleanNumber(m.numero) || m.codigo,
    modality,
    status: 'concluida',
    object: m.titulo,
    content: null,
    year,
    fileUrl: fileUrl(m),
    isActive: true,
  }
}
