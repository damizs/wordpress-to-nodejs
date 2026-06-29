import { resolveDocumentFileUrl } from '#helpers/document_file_url'

/** Tipos JetEngine que viram atividade legislativa (importador dedicado). */
export const LEGISLATIVE_MATERIA_TYPES = new Set([
  'REQUERIMENTO',
  'RESOLUÇÃO LEGISLATIVA',
  'PROJETO DE LEI LEGISLATIVO',
  'INDICACAO',
  'EMENDA',
  'DECRETO LEGISLATIVO',
  'PROJETO DE RESOLUÇÃO',
])

/** Tipos WP que são atos de licitação/contratação (GetPublic + painel de licitações). */
export const LICITACAO_MATERIA_TYPES = new Set([
  'Aviso de Licitação',
  'Extrato de Contrato',
  'Termo de Adjudicação',
  'Extrato de Dispensa de Licitação',
  'Demais Atos de Licitação',
  'Extrato de inexigibilidade',
  'Extrato de Aditivo',
  'Aviso de Habilitação',
  'Extrato de Ratificação',
  'Edital de Licitação',
  'Termo de Homologação',
  'Aditivo',
  'RESULTADO',
])

const LICITACAO_TITLE_RE =
  /\b(DV\s*\d|PE\s*\d|dispensa|licitaç|pregão|habilitação|adjudicaç|homologaç|contrataç|contrato|contratual|apostilamento|gestor\s+e\s+fiscal|ordem\s+de\s+serviço|inexigib|ratificaç|edital|processo\s+administrativo)\b/i

const ADMIN_ATA_TITLE_RE =
  /\b(reunião|comissão|orçamento|votação|plano de contratação|mesa diretora)\b/i

export type MateriaRoute =
  | { target: 'skip' }
  | { target: 'licitacao'; modality: string; fileUrl: string | null }
  | { target: 'publicacao'; type: string; fileUrl: string | null }

export interface MateriaLike {
  tipo: string
  titulo?: string
  conteudo?: string | null
  codigo?: string | null
  /** Alias usado em registros já persistidos */
  title?: string
  description?: string | null
  number?: string | null
  type?: string | null
}

function pickTitle(m: MateriaLike): string {
  return String(m.titulo || m.title || '').trim()
}

function pickContent(m: MateriaLike): string {
  return String(m.conteudo || m.description || '')
}

function pickCode(m: MateriaLike): string | null {
  const code = m.codigo ?? m.number
  return code ? String(code).trim() : null
}

export function isGetpublicContent(content: string | null | undefined, code?: string | null): boolean {
  if (content?.includes('getpublic.inf.br')) return true
  return /^\d{14}$/.test(String(code || '').trim())
}

export function isLicitacaoTitle(title: string): boolean {
  return LICITACAO_TITLE_RE.test(title)
}

function publicationTypeFor(tipo: string, title: string): string {
  const map: Record<string, string> = {
    Portaria: 'Portaria',
    Ata: 'Ata Administrativa',
    EDITAL: 'Edital',
    Decreto: 'Decreto',
    'Atos Administrativos': 'Ato Administrativo',
    'Outros Atos Administrativos': 'Ato Administrativo',
  }
  if (map[tipo]) return map[tipo]
  const lower = title.toLowerCase()
  if (lower.includes('portaria')) return 'Portaria'
  if (lower.includes('decreto')) return 'Decreto'
  if (lower.includes('resolução')) return 'Resolução'
  return 'Outros'
}

/**
 * Decide para qual módulo nativo uma matéria WP / registro migrado deve ir.
 *
 * Regras principais (espelham o WP):
 * - GetPublic + atas de habilitação → Licitações (não Publicações)
 * - Tipos de licitação → Licitações
 * - Portarias/decretos/atas administrativas → Publicações Oficiais
 * - Legislativo → skip (importador wp:activities)
 */
export function routeMateria(m: MateriaLike): MateriaRoute {
  const tipo = String(m.tipo || m.type || '').trim()
  const title = pickTitle(m)
  const content = pickContent(m)
  const code = pickCode(m)
  const fileUrl = resolveDocumentFileUrl(null, content, code)
  const fromGetpublic = isGetpublicContent(content, code)

  if (LEGISLATIVE_MATERIA_TYPES.has(tipo)) {
    return { target: 'skip' }
  }

  if (tipo === 'Ata') {
    // Atas de sessão/comissão ficam em publicações; atas GetPublic de habilitação → licitações
    if (fromGetpublic || (isLicitacaoTitle(title) && !ADMIN_ATA_TITLE_RE.test(title))) {
      return { target: 'licitacao', modality: 'Ata de Habilitação', fileUrl }
    }
    return { target: 'publicacao', type: 'Ata Administrativa', fileUrl }
  }

  if (LICITACAO_MATERIA_TYPES.has(tipo)) {
    return { target: 'licitacao', modality: tipo, fileUrl }
  }

  if (tipo === 'EDITAL' && isLicitacaoTitle(title)) {
    return { target: 'licitacao', modality: 'Edital de Licitação', fileUrl }
  }

  // Conteúdo publicado via GetPublic/diário com vocabulário de licitação
  if (fromGetpublic && isLicitacaoTitle(`${title} ${tipo}`)) {
    return { target: 'licitacao', modality: tipo || 'Demais Atos de Licitação', fileUrl }
  }

  return {
    target: 'publicacao',
    type: publicationTypeFor(tipo, title),
    fileUrl,
  }
}

/** Slug estável para upsert na remigração (mesma lógica do wp:migrate). */
export function materiaSlug(tipo: string, codigo: string, title: string): string {
  const base = codigo ? `${tipo}-${codigo}` : title
  return base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}
