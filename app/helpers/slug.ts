/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Generate a slug for a legislative activity
 * e.g. "projeto-de-resolucao-no-163-jose-erinaldo"
 */
export function activitySlug(type: string, number: string, author?: string | null): string {
  const typeMap: Record<string, string> = {
    projeto_lei: 'projeto-de-lei',
    requerimento: 'requerimento',
    mocao: 'mocao',
    indicacao: 'indicacao',
    resolucao: 'resolucao',
    emenda: 'emenda',
    projeto_resolucao: 'projeto-de-resolucao',
  }
  const typePart = typeMap[type] || generateSlug(type)
  const numPart = `no-${number.replace(/\//g, '-')}`
  const authorPart = author ? `-${generateSlug(author)}` : ''
  return `${typePart}-${numPart}${authorPart}`
}

/**
 * Generate a slug for a plenary session
 * e.g. "sessao-ordinaria-15-01-2025"
 */
export function sessionSlug(title: string, date?: string): string {
  const base = generateSlug(title)
  if (date) {
    const d = date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3-$2-$1')
    return `${base}-${d}`
  }
  return base
}
