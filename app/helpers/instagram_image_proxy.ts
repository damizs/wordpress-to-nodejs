const MAX_BYTES = 10 * 1024 * 1024

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
  Referer: 'https://www.instagram.com/',
}

export function parseAllowedInstagramCdnUrl(raw: string): URL | null {
  try {
    const url = new URL(String(raw || ''))
    if (url.protocol !== 'https:') return null
    if (url.hostname === 'cdninstagram.com' || url.hostname.endsWith('.cdninstagram.com')) {
      return url
    }
    return null
  } catch {
    return null
  }
}

export async function fetchInstagramCdnImage(
  url: URL
): Promise<{ buffer: Buffer; contentType: string }> {
  const imageResponse = await fetch(url.toString(), { headers: FETCH_HEADERS, redirect: 'manual' })

  if (imageResponse.status >= 300 && imageResponse.status < 400) {
    throw new Error('Redirecionamento não permitido')
  }

  if (!imageResponse.ok) {
    throw new Error(`Falha ao carregar imagem (${imageResponse.status})`)
  }

  const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
  if (!contentType.toLowerCase().startsWith('image/')) {
    throw new Error('Tipo de conteúdo inválido')
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer())
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error('Imagem muito grande')
  }

  return { buffer, contentType }
}
