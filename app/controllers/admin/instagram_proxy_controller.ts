import type { HttpContext } from '@adonisjs/core/http'
import { parseAllowedInstagramCdnUrl, fetchInstagramCdnImage } from '#helpers/instagram_image_proxy'

export default class InstagramProxyController {
  async image({ request, response }: HttpContext) {
    const url = parseAllowedInstagramCdnUrl(String(request.input('url') || ''))
    if (!url) {
      return response.status(400).send('URL inválida')
    }

    try {
      const { buffer, contentType } = await fetchInstagramCdnImage(url)
      response.header('Content-Type', contentType)
      response.header('Cache-Control', 'public, max-age=86400')
      return response.send(buffer)
    } catch (error) {
      console.error('Instagram proxy error:', error)
      return response.status(500).send('Erro no proxy')
    }
  }
}
