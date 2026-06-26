import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import TwofaService from '#services/twofa_service'

const SETUP_SECRET_KEY = 'twofa_setup_secret'

/**
 * Autogestão de 2FA pelo próprio usuário do painel (qualquer usuário autenticado).
 * Rotas em /painel/conta/seguranca — só exigem `middleware.auth()`.
 */
export default class AccountSecurityController {
  /** Confere a senha atual do usuário (scrypt, igual ao login). */
  private async passwordMatches(passwordHash: string, plain: string): Promise<boolean> {
    if (!plain) return false
    try {
      return await hash.use('scrypt').verify(passwordHash, plain)
    } catch {
      return false
    }
  }

  async index({ inertia, auth, session }: HttpContext) {
    const user = auth.user!
    const enabled = !!user.twofaEnabled && !!user.twofaSecret

    // Setup em andamento: segredo provisório guardado em sessão (ainda não persistido).
    let setup: { secret: string; otpauth: string; qr: string } | null = null
    if (!enabled) {
      const pendingSecret = session.get(SETUP_SECRET_KEY)
      if (pendingSecret) {
        const otpauth = TwofaService.keyUri(user.email, pendingSecret)
        const qr = await TwofaService.qrCodeDataUrl(otpauth)
        setup = { secret: pendingSecret, otpauth, qr }
      }
    }

    // Códigos de backup recém-gerados (mostrados UMA vez, via flash).
    const flashed = session.flashMessages.get('twofaBackupCodes')
    const generatedBackupCodes = Array.isArray(flashed)
      ? (flashed as string[])
      : null

    const backupCodesRemaining = enabled
      ? TwofaService.parseBackupCodes(user.twofaBackupCodes).length
      : 0

    return inertia.render('admin/security/two-factor', {
      enabled,
      setup,
      generatedBackupCodes,
      backupCodesRemaining,
      backupCodeCount: TwofaService.backupCodeCount,
    })
  }

  /** Inicia a configuração: gera um segredo provisório e mostra o QR. */
  async start({ auth, response, session }: HttpContext) {
    const user = auth.user!
    if (user.twofaEnabled && user.twofaSecret) {
      session.flash('error', 'A verificação em duas etapas já está ativa.')
      return response.redirect().toPath('/painel/conta/seguranca')
    }
    session.put(SETUP_SECRET_KEY, TwofaService.generateSecret())
    return response.redirect().toPath('/painel/conta/seguranca')
  }

  /** Cancela uma configuração em andamento (descarta o segredo provisório). */
  async cancel({ response, session }: HttpContext) {
    session.forget(SETUP_SECRET_KEY)
    return response.redirect().toPath('/painel/conta/seguranca')
  }

  /** Confirma o código TOTP e ATIVA o 2FA, gerando os códigos de backup. */
  async enable({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    if (user.twofaEnabled && user.twofaSecret) {
      session.flash('error', 'A verificação em duas etapas já está ativa.')
      return response.redirect().toPath('/painel/conta/seguranca')
    }

    const secret = session.get(SETUP_SECRET_KEY)
    if (!secret) {
      session.flash('error', 'Sessão de configuração expirada. Recomece a ativação.')
      return response.redirect().toPath('/painel/conta/seguranca')
    }

    const code = String(request.input('code', '')).trim()
    if (!TwofaService.verifyToken(code, secret)) {
      session.flash('error', 'Código inválido. Verifique o app autenticador e tente de novo.')
      return response.redirect().toPath('/painel/conta/seguranca')
    }

    const plainCodes = TwofaService.generateBackupCodes()
    const hashes = await TwofaService.hashBackupCodes(plainCodes)

    user.twofaSecret = secret
    user.twofaEnabled = true
    user.twofaBackupCodes = TwofaService.serializeBackupCodes(hashes)
    await user.save()

    session.forget(SETUP_SECRET_KEY)
    // Mostra os códigos UMA vez (em claro) — depois só ficam hasheados.
    session.flash('twofaBackupCodes', plainCodes)
    session.flash('success', 'Verificação em duas etapas ativada. Guarde seus códigos de backup.')
    return response.redirect().toPath('/painel/conta/seguranca')
  }

  /** Desativa o 2FA — exige a senha atual OU um código TOTP válido. */
  async disable({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    if (!user.twofaEnabled) {
      session.flash('error', 'A verificação em duas etapas não está ativa.')
      return response.redirect().toPath('/painel/conta/seguranca')
    }

    const password = String(request.input('password', ''))
    const code = String(request.input('code', '')).trim()

    const okPassword = password ? await this.passwordMatches(user.password, password) : false
    const okCode = code && user.twofaSecret ? TwofaService.verifyToken(code, user.twofaSecret) : false

    if (!okPassword && !okCode) {
      session.flash('error', 'Confirme com sua senha atual ou um código do app para desativar.')
      return response.redirect().toPath('/painel/conta/seguranca')
    }

    user.twofaEnabled = false
    user.twofaSecret = null
    user.twofaBackupCodes = null
    await user.save()

    session.forget(SETUP_SECRET_KEY)
    session.flash('success', 'Verificação em duas etapas desativada.')
    return response.redirect().toPath('/painel/conta/seguranca')
  }

  /** Regenera os códigos de backup — exige senha atual OU código TOTP. */
  async regenerateBackupCodes({ auth, request, response, session }: HttpContext) {
    const user = auth.user!
    if (!user.twofaEnabled || !user.twofaSecret) {
      session.flash('error', 'A verificação em duas etapas não está ativa.')
      return response.redirect().toPath('/painel/conta/seguranca')
    }

    const password = String(request.input('password', ''))
    const code = String(request.input('code', '')).trim()

    const okPassword = password ? await this.passwordMatches(user.password, password) : false
    const okCode = code ? TwofaService.verifyToken(code, user.twofaSecret) : false

    if (!okPassword && !okCode) {
      session.flash('error', 'Confirme com sua senha atual ou um código do app para gerar novos códigos.')
      return response.redirect().toPath('/painel/conta/seguranca')
    }

    const plainCodes = TwofaService.generateBackupCodes()
    user.twofaBackupCodes = TwofaService.serializeBackupCodes(
      await TwofaService.hashBackupCodes(plainCodes)
    )
    await user.save()

    session.flash('twofaBackupCodes', plainCodes)
    session.flash('success', 'Novos códigos de backup gerados. Os anteriores foram invalidados.')
    return response.redirect().toPath('/painel/conta/seguranca')
  }
}
