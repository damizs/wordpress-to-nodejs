/** Upload para /painel/midia/upload (compartilhado por editores e blocos). */
export function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export async function uploadMediaFile(file: File | Blob, filename?: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file, filename)
  const res = await fetch('/painel/midia/upload', {
    method: 'POST',
    headers: { 'X-CSRF-TOKEN': getCsrfToken() },
    body: fd,
    credentials: 'same-origin',
  })
  if (!res.ok) {
    let msg = `Falha no upload (HTTP ${res.status})`
    try {
      const json = await res.json()
      if (json?.error) msg = json.error
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  const json = await res.json()
  if (!json?.url) throw new Error('Resposta de upload sem URL')
  return json.url as string
}
