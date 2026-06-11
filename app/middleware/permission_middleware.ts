import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware de autorização por permissão (RBAC).
 * Uso: middleware.can(['noticia.editar']) — semântica "qualquer uma das listadas".
 * Deve rodar após middleware.auth().
 */
export default class PermissionMiddleware {
  async handle(ctx: HttpContext, next: NextFn, permissions: string[]) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.redirect().toPath('/login')
    }

    const allowed = await user.canAny(permissions)
    if (!allowed) {
      if (ctx.request.method() === 'GET') {
        ctx.session.flash('error', 'Você não tem permissão para acessar esta área.')
        return ctx.response.redirect().toPath('/painel')
      }
      ctx.session.flash('error', 'Você não tem permissão para executar esta ação.')
      return ctx.response.redirect().back()
    }

    return next()
  }
}
