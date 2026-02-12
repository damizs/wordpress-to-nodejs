import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async showLogin({ inertia, auth, response }: HttpContext) {
    if (auth.isAuthenticated) {
      return response.redirect('/painel')
    }
    return inertia.render('auth/login')
  }

  async login({ request, auth, response, session }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const user = await User.verifyCredentials(email, password)

      if (!user.isActive) {
        session.flash('error', 'Conta desativada. Contate o administrador.')
        return response.redirect('/login')
      }

      if (!['super_admin', 'admin', 'editor'].includes(user.role)) {
        session.flash('error', 'Sem permissão de acesso ao painel.')
        return response.redirect('/login')
      }

      await auth.use('web').login(user)
      return response.redirect('/painel')
    } catch {
      session.flash('error', 'Email ou senha inválidos.')
      return response.redirect('/login')
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
