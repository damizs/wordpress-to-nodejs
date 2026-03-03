import type { HttpContext } from '@adonisjs/core/http'

export default class InstagramProxyController {
  /**
   * Proxy para imagens do Instagram (contorna CORS)
   */
  async image({ request, response }: HttpContext) {
    const url = request.input('url')
    
    if (!url || !url.includes('cdninstagram.com')) {
      return response.status(400).send('URL inválida')
    }

    try {
      const imageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Referer': 'https://www.instagram.com/',
        },
      })

      if (!imageResponse.ok) {
        return response.status(imageResponse.status).send('Erro ao carregar imagem')
      }

      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
      const buffer = await imageResponse.arrayBuffer()

      response.header('Content-Type', contentType)
      response.header('Cache-Control', 'public, max-age=86400') // Cache 24h
      response.header('Access-Control-Allow-Origin', '*')
      
      return response.send(Buffer.from(buffer))
    } catch (error: any) {
      console.error('Instagram proxy error:', error.message)
      return response.status(500).send('Erro no proxy')
    }
  }
}
