import { test } from '@japa/runner'
import { PERMISSIONS, ROLES } from '../../database/seeders/rbac_seeder.js'

test.group('RBAC publicador', () => {
  test('keeps publicador focused on content, atas and pautas', ({ assert }) => {
    const publicador = ROLES.find((role) => role.slug === 'publicador')
    assert.exists(publicador)

    const permissions = publicador?.permissions === '*' ? [] : (publicador?.permissions ?? [])
    const required = [
      'noticia.criar',
      'noticia.editar',
      'noticia.publicar',
      'publicacao.gerenciar',
      'ata.ver',
      'ata.criar',
      'ata.editar',
      'ata.excluir',
      'pauta.ver',
      'pauta.criar',
      'pauta.editar',
      'pauta.excluir',
    ]
    const forbidden = ['usuario.gerenciar', 'papel.gerenciar', 'seguranca.gerenciar']

    assert.isTrue(required.every((permission) => permissions.includes(permission)))
    assert.isTrue(forbidden.every((permission) => !permissions.includes(permission)))
  })

  test('registers granular permissions for atas and pautas', ({ assert }) => {
    const catalog = new Set(PERMISSIONS.map((permission) => permission.name))
    const granularPermissions = [
      'ata.ver',
      'ata.criar',
      'ata.editar',
      'ata.excluir',
      'pauta.ver',
      'pauta.criar',
      'pauta.editar',
      'pauta.excluir',
    ]

    assert.isTrue(granularPermissions.every((permission) => catalog.has(permission)))
  })
})
