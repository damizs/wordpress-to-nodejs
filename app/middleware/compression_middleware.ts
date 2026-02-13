import compression from 'compression'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const compress = compression({ threshold: 1024, level: 6 })

export default class CompressionMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    await new Promise<void>((resolve, reject) => {
      compress(request.request as any, response.response as any, (err?: any) => {
        if (err) reject(err)
        else resolve()
      })
    })
    return next()
  }
}
