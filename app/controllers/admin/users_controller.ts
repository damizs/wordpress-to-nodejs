import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

export default class UsersController {
  /**
   * Anti-escalonamento de privilégio: um usuário só pode atribuir papéis cujas
   * permissões sejam um subconjunto das suas próprias. Administradores (curinga
   * '*') podem atribuir qualquer papel. Retorna null se OK, ou mensagem de erro.
   */
  private async assertCanAssignRoles(actor: User, roleIds: number[]): Promise<string | null> {
    if (roleIds.length === 0) return null

    const actorPerms = await actor.getPermissionNames()
    if (actorPerms.includes('*')) return null

    const roles = await Role.query().whereIn('id', roleIds).preload('permissions')

    // Papéis de sistema (ex.: Administrador) só por quem tem acesso total
    if (roles.some((r) => r.isSystem)) {
      return 'Você não tem permissão para atribuir o papel Administrador.'
    }

    const actorSet = new Set(actorPerms)
    for (const role of roles) {
      for (const perm of role.permissions) {
        if (!actorSet.has(perm.name)) {
          return 'Você não pode atribuir papéis com permissões superiores às suas.'
        }
      }
    }
    return null
  }

  async index({ inertia }: HttpContext) {
    const users = await User.query().preload('roles').orderBy('full_name')
    return inertia.render('admin/users/index', {
      users: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        isActive: u.isActive,
        roles: u.roles.map((r) => ({ id: r.id, name: r.name })),
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    const roles = await Role.query().orderBy('name')
    return inertia.render('admin/users/form', {
      user: null,
      roles: roles.map((r) => ({ id: r.id, name: r.name, description: r.description })),
    })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const data = request.only(['full_name', 'email', 'password', 'is_active', 'role_ids'])

    const fullName = String(data.full_name ?? '').trim()
    const email = String(data.email ?? '').trim().toLowerCase()
    const password = String(data.password ?? '')

    if (!fullName || !email || !password) {
      session.flash('error', 'Nome, e-mail e senha são obrigatórios.')
      return response.redirect().back()
    }
    if (fullName.length < 3 || fullName.length > 120) {
      session.flash('error', 'O nome deve ter entre 3 e 120 caracteres.')
      return response.redirect().back()
    }
    if (!EMAIL_RE.test(email) || email.length > 180) {
      session.flash('error', 'Informe um e-mail válido.')
      return response.redirect().back()
    }
    if (password.length < MIN_PASSWORD) {
      session.flash('error', `A senha deve ter ao menos ${MIN_PASSWORD} caracteres.`)
      return response.redirect().back()
    }

    const existing = await User.query().whereRaw('lower(email) = ?', [email]).first()
    if (existing) {
      session.flash('error', 'Já existe um usuário com este e-mail.')
      return response.redirect().back()
    }

    const roleIds = Array.isArray(data.role_ids) ? data.role_ids.map(Number).filter(Boolean) : []
    const escalation = await this.assertCanAssignRoles(auth.user!, roleIds)
    if (escalation) {
      session.flash('error', escalation)
      return response.redirect().back()
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: 'editor', // enum legado: novos usuários são governados pelos papéis RBAC
      isActive: data.is_active !== false && data.is_active !== 'false',
    })

    if (roleIds.length > 0) {
      await user.related('roles').sync(roleIds)
    }

    session.flash('success', 'Usuário criado com sucesso!')
    return response.redirect().toPath('/painel/usuarios')
  }

  async edit({ params, inertia }: HttpContext) {
    const user = await User.query().where('id', params.id).preload('roles').firstOrFail()
    const roles = await Role.query().orderBy('name')
    return inertia.render('admin/users/form', {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        roleIds: user.roles.map((r) => r.id),
      },
      roles: roles.map((r) => ({ id: r.id, name: r.name, description: r.description })),
    })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = request.only(['full_name', 'email', 'password', 'is_active', 'role_ids'])
    const isSelf = auth.user!.id === user.id

    const fullName = String(data.full_name ?? '').trim()
    const email = String(data.email ?? '').trim().toLowerCase()
    const password = String(data.password ?? '')
    const isActive = data.is_active !== false && data.is_active !== 'false'

    if (!fullName || !email) {
      session.flash('error', 'Nome e e-mail são obrigatórios.')
      return response.redirect().back()
    }
    if (fullName.length < 3 || fullName.length > 120) {
      session.flash('error', 'O nome deve ter entre 3 e 120 caracteres.')
      return response.redirect().back()
    }
    if (!EMAIL_RE.test(email) || email.length > 180) {
      session.flash('error', 'Informe um e-mail válido.')
      return response.redirect().back()
    }
    if (password && password.length < MIN_PASSWORD) {
      session.flash('error', `A senha deve ter ao menos ${MIN_PASSWORD} caracteres.`)
      return response.redirect().back()
    }

    // E-mail único (ignorando o próprio registro)
    const dup = await User.query()
      .whereRaw('lower(email) = ?', [email])
      .whereNot('id', user.id)
      .first()
    if (dup) {
      session.flash('error', 'Já existe outro usuário com este e-mail.')
      return response.redirect().back()
    }

    // Não permitir que o usuário desative a própria conta (auto-bloqueio)
    if (isSelf && !isActive) {
      session.flash('error', 'Você não pode desativar a sua própria conta.')
      return response.redirect().back()
    }

    const roleIds = Array.isArray(data.role_ids) ? data.role_ids.map(Number).filter(Boolean) : []

    // Anti-escalonamento: só atribui papéis dentro do próprio nível de permissão
    const escalation = await this.assertCanAssignRoles(auth.user!, roleIds)
    if (escalation) {
      session.flash('error', escalation)
      return response.redirect().back()
    }

    // Não deixar o usuário remover o próprio acesso de administrador
    if (isSelf) {
      const adminRole = await Role.findBy('slug', 'administrador')
      if (adminRole && !roleIds.includes(adminRole.id)) {
        const hadAdmin = await user.related('roles').query().where('roles.id', adminRole.id).first()
        if (hadAdmin) {
          session.flash('error', 'Você não pode remover seu próprio papel de Administrador.')
          return response.redirect().back()
        }
      }
    }

    user.merge({ fullName, email, isActive })
    if (password) {
      user.password = password
    }
    await user.save()

    await user.related('roles').sync(roleIds)

    session.flash('success', 'Usuário atualizado com sucesso!')
    return response.redirect().toPath('/painel/usuarios')
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    if (auth.user!.id === Number(params.id)) {
      session.flash('error', 'Você não pode excluir seu próprio usuário.')
      return response.redirect().back()
    }
    const user = await User.findOrFail(params.id)
    await user.delete()
    session.flash('success', 'Usuário excluído com sucesso!')
    return response.redirect().toPath('/painel/usuarios')
  }
}
