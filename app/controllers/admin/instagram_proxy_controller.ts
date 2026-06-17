import type { HttpContext } from '@adonisjs/core/http'

export default class InstagramProxyController {
  async image({ request, response }: HttpContext) {
    let url: URL
    try {
      url = new URL(String(request.input('url') || ''))
    } catch {
      return response.status(400).send('URL inválida')
    }

    const allowedHost =
      url.protocol === 'https:' &&
      (url.hostname === 'cdninstagram.com' || url.hostname.endsWith('.cdninstagram.com'))

    if (!allowedHost) {
      return response.status(400).send('URL inválida')
    }

    try {
      const imageResponse = await fetch(url.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
          Referer: 'https://www.instagram.com/',
        },
      })

      if (!imageResponse.ok) {
        return response.status(imageResponse.status).send('Erro ao carregar imagem')
      }

      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
      if (!contentType.toLowerCase().startsWith('image/')) {
        return response.status(415).send('Tipo de conteúdo inválido')
      }

      const buffer = await imageResponse.arrayBuffer()
      if (buffer.byteLength > 10 * 1024 * 1024) {
        return response.status(413).send('Imagem muito grande')
      }

      response.header('Content-Type', contentType)
      response.header('Cache-Control', 'public, max-age=86400')

      return response.send(Buffer.from(buffer))
    } catch (error) {
      console.error('Instagram proxy error:', error)
      return response.status(500).send('Erro no proxy')
    }
  }
}
