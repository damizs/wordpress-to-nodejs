import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import SiteSetting from '#models/site_setting'
import { loginValidator } from '#validators/auth'
import {
  clearFailedLogins,
  isLoginRateLimited,
  recordFailedLogin,
} from '#services/login_rate_limiter'
import TwofaService from '#services/twofa_service'
import EvolutionAlertService from '#services/evolution_alert_service'
import ActivityLogService from '#services/activity_log_service'

const TWOFA_PENDING_KEY = 'twofa_pending_user'

export default class AuthController {
  private async completeLogin(ctx: HttpContext, user: User, mode: 'password' | '2fa') {
    await ctx.auth.use('web').login(user)
    user.lastLoginAt = DateTime.now()
    user.lastLoginIp = ctx.request.ip()
    await user.save()
    await ActivityLogService.log(ctx, {
      action: 'login.success',
      resource: 'auth',
      resourceId: user.id,
      message: mode === '2fa' ? 'Login concluído com 2FA' : 'Login concluído com senha',
      metadata: { email: user.email, mode },
    })
  }

  async showLogin({ inertia, auth, response }: HttpContext) {
    if (auth.isAuthenticated) {
      return response.redirect('/painel')
    }
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('auth/login', { siteSettings })
  }

  async login(ctx: HttpContext) {
    const { request, response, session } = ctx
    const { email, password } = await request.validateUsing(loginValidator)
    const ip = request.ip()

    if (isLoginRateLimited(ip, email)) {
      void EvolutionAlertService.sendAlert(
        'login',
        'Login bloqueado por limite',
        `O painel bloqueou novas tentativas para ${email} a partir do IP ${ip}.`,
        {
          dedupeKey: `login-rate:${ip}:${email}`,
          throttleMinutes: 60,
          metadata: { ip, email },
        }
      ).catch(() => null)
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

      // Credenciais válidas. Se o usuário ativou 2FA, NÃO autentica ainda:
      // guarda um estado pendente em sessão e exige o segundo fator.
      if (user.twofaEnabled && user.twofaSecret) {
        clearFailedLogins(ip, email)
        session.put(TWOFA_PENDING_KEY, user.id)
        await ActivityLogService.log(ctx, {
          action: 'login.2fa_required',
          resource: 'auth',
          resourceId: user.id,
          metadata: { email },
        })
        return response.redirect('/login/2fa')
      }

      await this.completeLogin(ctx, user, 'password')
      clearFailedLogins(ip, email)
      return response.redirect('/painel')
    } catch {
      recordFailedLogin(ip, email)
      await ActivityLogService.log(ctx, {
        action: 'login.failed',
        resource: 'auth',
        statusCode: 401,
        metadata: { email },
      })
      if (isLoginRateLimited(ip, email)) {
        void EvolutionAlertService.sendAlert(
          'login',
          'Tentativas suspeitas de login',
          `O painel recebeu varias tentativas invalidas para ${email} a partir do IP ${ip}.`,
          {
            dedupeKey: `login-failed:${ip}:${email}`,
            throttleMinutes: 60,
            metadata: { ip, email },
          }
        ).catch(() => null)
      }
      session.flash('error', 'Email ou senha inválidos.')
      return response.redirect('/login')
    }
  }

  /** Tela do segundo fator — só acessível quem passou pelas credenciais. */
  async showTwofa({ inertia, session, response }: HttpContext) {
    const pendingId = session.get(TWOFA_PENDING_KEY)
    if (!pendingId) {
      return response.redirect('/login')
    }
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('auth/twofa', { siteSettings })
  }

  /** Verifica o código TOTP ou um código de backup e conclui o login. */
  async verifyTwofa(ctx: HttpContext) {
    const { request, response, session } = ctx
    const pendingId = session.get(TWOFA_PENDING_KEY)
    if (!pendingId) {
      return response.redirect('/login')
    }

    const user = await User.find(pendingId)
    if (!user || !user.isActive || !user.twofaEnabled || !user.twofaSecret) {
      session.forget(TWOFA_PENDING_KEY)
      session.flash('error', 'Sessão de verificação inválida. Faça login novamente.')
      return response.redirect('/login')
    }

    const ip = request.ip()
    const email = user.email

    // Rate limit reaproveitando o limitador de login (por usuário/IP).
    if (isLoginRateLimited(ip, email)) {
      void EvolutionAlertService.sendAlert(
        'login',
        '2FA bloqueado por limite',
        `O painel bloqueou novas tentativas de 2FA para ${email} a partir do IP ${ip}.`,
        {
          dedupeKey: `2fa-rate:${ip}:${email}`,
          throttleMinutes: 60,
          metadata: { ip, email },
        }
      ).catch(() => null)
      session.flash('error', 'Muitas tentativas. Aguarde alguns minutos e tente novamente.')
      return response.redirect('/login/2fa')
    }

    const rawCode = String(request.input('code', '')).trim()
    if (!rawCode) {
      session.flash('error', 'Informe o código de verificação.')
      return response.redirect('/login/2fa')
    }

    // 1) Tenta TOTP (6 dígitos).
    let authorized = TwofaService.verifyToken(rawCode, user.twofaSecret)

    // 2) Se não for um TOTP válido, tenta um código de backup (uso único).
    if (!authorized) {
      const hashes = TwofaService.parseBackupCodes(user.twofaBackupCodes)
      if (hashes.length > 0) {
        const remaining = await TwofaService.consumeBackupCode(rawCode, hashes)
        if (remaining) {
          user.twofaBackupCodes = TwofaService.serializeBackupCodes(remaining)
          await user.save()
          authorized = true
        }
      }
    }

    if (!authorized) {
      recordFailedLogin(ip, email)
      await ActivityLogService.log(ctx, {
        action: 'login.2fa_failed',
        resource: 'auth',
        resourceId: user.id,
        statusCode: 401,
        metadata: { email },
      })
      session.flash('error', 'Código inválido. Tente o código do app ou um código de backup.')
      return response.redirect('/login/2fa')
    }

    await this.completeLogin(ctx, user, '2fa')
    session.forget(TWOFA_PENDING_KEY)
    clearFailedLogins(ip, email)
    return response.redirect('/painel')
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
