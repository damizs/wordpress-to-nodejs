import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import SiteSetting from '#models/site_setting'
import { loginValidator } from '#validators/auth'
import {
  clearFailedLogins,
  isLoginRateLimited,
  recordFailedLogin,
} from '#services/login_rate_limiter'

export default class AuthController {
  async showLogin({ inertia, auth, response }: HttpContext) {
    if (auth.isAuthenticated) {
      return response.redirect('/painel')
    }
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('auth/login', { siteSettings })
  }

  async login({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const ip = request.ip()

    if (isLoginRateLimited(ip, email)) {
      session.flash('error', 'Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.')
      return response.redirect('/login')
    }

    try {
      const user = await User.verifyCredentials(email, password)

      if (!user.isActive) {
        session.flash('error', 'Conta desativada. Contate o administrador.')
        return response.redirect('/login')
      }

      // Acesso ao painel: precisa ter ao menos uma permissão (papel RBAC ou enum legado)
      const permissions = await user.getPermissionNames()
      if (permissions.length === 0) {
        session.flash('error', 'Sem permissão de acesso ao painel.')
        return response.redirect('/login')
      }

      await auth.use('web').login(user)
      clearFailedLogins(ip, email)
      return response.redirect('/painel')
    } catch {
      recordFailedLogin(ip, email)
      session.flash('error', 'Email ou senha inválidos.')
      return response.redirect('/login')
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
