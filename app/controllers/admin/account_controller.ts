import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'

/** Avatares pré-definidos disponíveis para o usuário escolher (em /public/avatars). */
const PRESET_AVATARS = Array.from({ length: 8 }, (_, i) => `/avatars/a${i + 1}.svg`)

const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(2).maxLength(255),
    // Validação fina do valor (precisa ser um dos presets ou vazio) é feita no controller.
    avatar: vine.string().trim().optional(),
  })
)

const updatePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string().minLength(1),
    newPassword: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .confirmed({ confirmationField: 'confirm' }),
  })
)

/**
 * Minha Conta — autogestão do próprio perfil pelo usuário autenticado do painel.
 * Apenas exige `middleware.auth()` (rotas em /painel/conta).
 *
 * O fluxo de 2FA é gerido pelo AccountSecurityController (/painel/conta/seguranca);
 * aqui só mostramos o estado atual e linkamos para lá.
 */
export default class AccountController {
  /** Confere a senha atual (scrypt, igual ao login / account_security). */
  private async passwordMatches(passwordHash: string, plain: string): Promise<boolean> {
    if (!plain) return false
    try {
      return await hash.use('scrypt').verify(passwordHash, plain)
    } catch {
      return false
    }
  }

  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!
    const twofaEnabled = !!user.twofaEnabled && !!user.twofaSecret

    return inertia.render('admin/account/index', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar ?? null,
      },
      twofaEnabled,
      presetAvatars: PRESET_AVATARS,
    })
  }

  /** Atualiza nome e avatar (avatar precisa ser um dos presets, senão vira null). */
  async updateProfile({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const { fullName, avatar } = await request.validateUsing(updateProfileValidator)

    const cleanAvatar = (avatar ?? '').trim()
    user.fullName = fullName
    user.avatar = cleanAvatar && PRESET_AVATARS.includes(cleanAvatar) ? cleanAvatar : null
    await user.save()

    session.flash('success', 'Perfil atualizado com sucesso.')
    return response.redirect().back()
  }

  /** Troca a senha: confere a atual, valida a nova (min 8 + confirmação) e grava. */
  async updatePassword({ request, auth, response, session }: HttpContext) {
    const user = auth.user!
    const { currentPassword, newPassword } = await request.validateUsing(updatePasswordValidator)

    const ok = await this.passwordMatches(user.password, currentPassword)
    if (!ok) {
      session.flash('error', 'A senha atual está incorreta.')
      return response.redirect().back()
    }

    // O hook do AuthFinder hasheia a senha automaticamente ao salvar.
    user.password = newPassword
    await user.save()

    session.flash('success', 'Senha alterada com sucesso.')
    return response.redirect().back()
  }
}
