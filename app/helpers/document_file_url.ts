const GETPUBLIC_CONVERT_RE = /getpublic\.inf\.br\/uploads\/CMSU\/convert\/(\d{14})\//
const GETPUBLIC_CODIGO_RE = /^\d{14}$/
const PDF_HREF_RE = /href=["']([^"']+\.pdf(?:[^"']*)?)["']/i

/** Identificador da entidade no GetPublic (Câmara Municipal de Sumé). */
export const GETPUBLIC_ENTITY = 'CMSU'

/**
 * URL pública da matéria no GetPublic — o visualizador oficial usado pelo site
 * (ex.: Diário Oficial, atos de licitação). NÃO usar /api/document/<id>/pdf:
 * aquele endpoint não é o link público correto e abre PDF cru. O visualizador
 * é uma página HTML (abrir em nova aba, não embedar em iframe).
 */
export function getpublicMateriaUrl(documentId: string): string {
  return `https://getpublic.inf.br/system/visualizar-materia?materia=${documentId}&link=${GETPUBLIC_ENTITY}`
}

/** Converte uma URL antiga /api/document/<id>/pdf para o visualizador correto. */
export function fixGetpublicUrl(url: string | null | undefined): string | null {
  if (!url) return url ?? null
  const m = url.match(/getpublic\.inf\.br\/api\/document\/(\d{14})\/pdf/)
  return m ? getpublicMateriaUrl(m[1]) : url
}

/**
 * Resolve a URL pública de um documento oficial:
 * 1. `file_url` nativo (upload ou migração WP) — corrigindo formato GetPublic antigo
 * 2. Link `.pdf` embutido no HTML da descrição
 * 3. Imagens GetPublic (`convert/{id}/`) → visualizador da matéria
 * 4. Código GetPublic de 14 dígitos no campo `number`
 */
export function resolveDocumentFileUrl(
  fileUrl: string | null | undefined,
  description: string | null | undefined,
  documentNumber: string | null | undefined
): string | null {
  const stored = fileUrl?.trim()
  if (stored) return fixGetpublicUrl(stored)

  const html = description || ''

  const pdfMatch = html.match(PDF_HREF_RE)
  if (pdfMatch?.[1]) {
    return pdfMatch[1].replace(/\\"/g, '').replace(/\\\//g, '/')
  }

  const convertMatch = html.match(GETPUBLIC_CONVERT_RE)
  if (convertMatch?.[1]) return getpublicMateriaUrl(convertMatch[1])

  const num = (documentNumber || '').trim()
  if (GETPUBLIC_CODIGO_RE.test(num)) return getpublicMateriaUrl(num)

  return null
}
