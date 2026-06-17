export const LEGISLATIVE_ORIGINS = ['legislativo', 'executivo', 'nao_informado'] as const

export type LegislativeOrigin = (typeof LEGISLATIVE_ORIGINS)[number]

export const LEGISLATIVE_ORIGIN_LABELS: Record<LegislativeOrigin, string> = {
  legislativo: 'Poder Legislativo',
  executivo: 'Poder Executivo',
  nao_informado: 'Origem não informada',
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeLegislativeOrigin(value: unknown): LegislativeOrigin {
  const normalized = normalizeText(value).replace(/[-\s]+/g, '_')
  if (normalized === 'executivo' || normalized === 'poder_executivo') return 'executivo'
  if (normalized === 'legislativo' || normalized === 'poder_legislativo') return 'legislativo'
  if (normalized === 'nao_informado' || normalized === 'nao_informada') return 'nao_informado'
  return 'nao_informado'
}

export function legislativeOriginLabel(value: unknown): string {
  return LEGISLATIVE_ORIGIN_LABELS[normalizeLegislativeOrigin(value)]
}

export function inferLegislativeOrigin(input: {
  type?: string | null
  title?: string | null
  summary?: string | null
  content?: string | null
  author?: string | null
  authorsCount?: number | null
  fallback?: unknown
}): LegislativeOrigin {
  const authorText = normalizeText(input.author)
  if (
    authorText.includes('executivo') ||
    authorText.includes('prefeito') ||
    authorText.includes('prefeitura')
  ) {
    return 'executivo'
  }

  if (
    (input.authorsCount ?? 0) > 0 ||
    authorText.includes('vereador') ||
    authorText.includes('vereadores') ||
    authorText.includes('mesa diretora') ||
    authorText.includes('comissao')
  ) {
    return 'legislativo'
  }

  const body = normalizeText(
    [input.type, input.title, input.summary, input.content].filter(Boolean).join(' ')
  )
  if (
    body.includes('poder executivo') ||
    body.includes('executivo municipal') ||
    body.includes('chefe do executivo') ||
    body.includes('gabinete do prefeito') ||
    body.includes('prefeito municipal') ||
    body.includes('prefeitura municipal') ||
    body.includes('mensagem do executivo') ||
    body.includes('lei orcamentaria anual') ||
    body.includes('diretrizes orcamentarias') ||
    body.includes('plano plurianual') ||
    body.includes('credito adicional')
  ) {
    return 'executivo'
  }

  return normalizeLegislativeOrigin(input.fallback)
}
