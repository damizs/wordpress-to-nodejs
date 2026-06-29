import { BaseSchema } from '@adonisjs/lucid/schema'

const PERMISSIONS = [
  { name: 'ata.ver', label: 'Ver atas', module: 'Legislativo' },
  { name: 'ata.criar', label: 'Criar atas', module: 'Legislativo' },
  { name: 'ata.editar', label: 'Editar atas', module: 'Legislativo' },
  { name: 'ata.excluir', label: 'Excluir atas', module: 'Legislativo' },
  { name: 'pauta.ver', label: 'Ver pautas', module: 'Legislativo' },
  { name: 'pauta.criar', label: 'Criar pautas', module: 'Legislativo' },
  { name: 'pauta.editar', label: 'Editar pautas', module: 'Legislativo' },
  { name: 'pauta.excluir', label: 'Excluir pautas', module: 'Legislativo' },
]

const PUBLICADOR_PERMISSIONS = [
  'noticia.criar',
  'noticia.editar',
  'noticia.publicar',
  'noticia.excluir',
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

export default class extends BaseSchema {
  async up() {
    if (!(await this.schema.hasTable('permissions'))) return
    if (!(await this.schema.hasTable('roles'))) return
    if (!(await this.schema.hasTable('role_permissions'))) return

    for (const permission of PERMISSIONS) {
      await this.db.rawQuery(
        `INSERT INTO permissions (name, label, module, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())
         ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label, module = EXCLUDED.module, updated_at = NOW()`,
        [permission.name, permission.label, permission.module]
      )
    }

    await this.db.rawQuery(
      `INSERT INTO roles (name, slug, description, is_system, created_at, updated_at)
       VALUES (?, ?, ?, false, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = NOW()`,
      [
        'Publicador',
        'publicador',
        'Publica notícias, publicações oficiais, atas e pautas sem acesso administrativo.',
      ]
    )

    await this.db.rawQuery(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id
       FROM roles r
       CROSS JOIN permissions p
       WHERE r.slug = 'publicador'
         AND p.name IN (${PUBLICADOR_PERMISSIONS.map(() => '?').join(', ')})
       ON CONFLICT (role_id, permission_id) DO NOTHING`,
      PUBLICADOR_PERMISSIONS
    )

    const granularPermissions = PERMISSIONS.map((permission) => permission.name)
    await this.db.rawQuery(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id
       FROM roles r
       CROSS JOIN permissions p
       WHERE r.slug IN ('administrador', 'gestor-sessoes', 'assessoria-legislativa')
         AND p.name IN (${granularPermissions.map(() => '?').join(', ')})
       ON CONFLICT (role_id, permission_id) DO NOTHING`,
      granularPermissions
    )
  }

  async down() {
    if (!(await this.schema.hasTable('roles'))) return
    await this.db.from('roles').where('slug', 'publicador').delete()
  }
}
