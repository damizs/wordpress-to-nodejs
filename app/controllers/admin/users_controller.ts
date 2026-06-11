import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'

export default class UsersController {
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

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['full_name', 'email', 'password', 'is_active', 'role_ids'])

    if (!data.full_name || !data.email || !data.password) {
      session.flash('error', 'Nome, e-mail e senha são obrigatórios.')
      return response.redirect().back()
    }

    const existing = await User.findBy('email', data.email)
    if (existing) {
      session.flash('error', 'Já existe um usuário com este e-mail.')
      return response.redirect().back()
    }

    const user = await User.create({
      fullName: data.full_name,
      email: data.email,
      password: data.password,
      role: 'editor', // enum legado: novos usuários são governados pelos papéis RBAC
      isActive: data.is_active !== false && data.is_active !== 'false',
    })

    const roleIds = Array.isArray(data.role_ids) ? data.role_ids.map(Number) : []
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

    user.merge({
      fullName: data.full_name,
      email: data.email,
      isActive: data.is_active !== false && data.is_active !== 'false',
    })
    if (data.password) {
      user.password = data.password
    }
    await user.save()

    const roleIds = Array.isArray(data.role_ids) ? data.role_ids.map(Number) : []

    // Não deixar o usuário remover o próprio acesso de administrador
    if (auth.user!.id === user.id) {
      const adminRole = await Role.findBy('slug', 'administrador')
      if (adminRole && !roleIds.includes(adminRole.id)) {
        const hadAdmin = await user.related('roles').query().where('roles.id', adminRole.id).first()
        if (hadAdmin) {
          session.flash('error', 'Você não pode remover seu próprio papel de Administrador.')
          return response.redirect().back()
        }
      }
    }

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
