const GETPUBLIC_CONVERT_RE = /getpublic\.inf\.br\/uploads\/CMSU\/convert\/(\d{14})\//
const GETPUBLIC_CODIGO_RE = /^\d{14}$/
const PDF_HREF_RE = /href=["']([^"']+\.pdf(?:[^"']*)?)["']/i

/** URL pública do PDF no sistema GetPublic (matérias licitatórias da Câmara). */
export function getpublicPdfUrl(documentId: string): string {
  return `https://getpublic.inf.br/api/document/${documentId}/pdf`
}

/**
 * Resolve a URL de download do PDF de um documento oficial:
 * 1. `file_url` nativo (upload ou migração WP)
 * 2. Link `.pdf` embutido no HTML da descrição
 * 3. Imagens GetPublic (`convert/{id}/`) → API `/api/document/{id}/pdf`
 * 4. Código GetPublic de 14 dígitos no campo `number`
 */
export function resolveDocumentFileUrl(
  fileUrl: string | null | undefined,
  description: string | null | undefined,
  documentNumber: string | null | undefined
): string | null {
  const stored = fileUrl?.trim()
  if (stored) return stored

  const html = description || ''

  const pdfMatch = html.match(PDF_HREF_RE)
  if (pdfMatch?.[1]) {
    return pdfMatch[1].replace(/\\"/g, '').replace(/\\\//g, '/')
  }

  const convertMatch = html.match(GETPUBLIC_CONVERT_RE)
  if (convertMatch?.[1]) return getpublicPdfUrl(convertMatch[1])

  const num = (documentNumber || '').trim()
  if (GETPUBLIC_CODIGO_RE.test(num)) return getpublicPdfUrl(num)

  return null
}
