import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import Permission from '#models/permission'
import { generateSlug } from '#helpers/slug'

export default class RolesController {
  async index({ inertia }: HttpContext) {
    const roles = await Role.query().preload('permissions').orderBy('name')
    return inertia.render('admin/roles/index', {
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        permissionCount: r.permissions.length,
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    const permissions = await Permission.query().orderBy('module').orderBy('label')
    return inertia.render('admin/roles/form', {
      role: null,
      permissions: permissions.map((p) => p.serialize()),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['name', 'description', 'permission_ids'])

    if (!data.name) {
      session.flash('error', 'Nome do papel é obrigatório.')
      return response.redirect().back()
    }

    const role = await Role.create({
      name: data.name,
      slug: generateSlug(data.name),
      description: data.description || null,
      isSystem: false,
    })

    const ids = Array.isArray(data.permission_ids) ? data.permission_ids.map(Number) : []
    await role.related('permissions').sync(ids)

    session.flash('success', 'Papel criado com sucesso!')
    return response.redirect().toPath('/painel/papeis')
  }

  async edit({ params, inertia }: HttpContext) {
    const role = await Role.query().where('id', params.id).preload('permissions').firstOrFail()
    const permissions = await Permission.query().orderBy('module').orderBy('label')
    return inertia.render('admin/roles/form', {
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissionIds: role.permissions.map((p) => p.id),
      },
      permissions: permissions.map((p) => p.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const role = await Role.findOrFail(params.id)
    const data = request.only(['name', 'description', 'permission_ids'])

    if (role.isSystem) {
      session.flash('error', 'O papel Administrador é do sistema e não pode ser alterado.')
      return response.redirect().toPath('/painel/papeis')
    }

    role.merge({
      name: data.name,
      description: data.description || null,
    })
    await role.save()

    const ids = Array.isArray(data.permission_ids) ? data.permission_ids.map(Number) : []
    await role.related('permissions').sync(ids)

    session.flash('success', 'Papel atualizado com sucesso!')
    return response.redirect().toPath('/painel/papeis')
  }

  async destroy({ params, response, session }: HttpContext) {
    const role = await Role.findOrFail(params.id)
    if (role.isSystem) {
      session.flash('error', 'O papel Administrador é do sistema e não pode ser excluído.')
      return response.redirect().back()
    }
    await role.delete()
    session.flash('success', 'Papel excluído com sucesso!')
    return response.redirect().toPath('/painel/papeis')
  }
}
