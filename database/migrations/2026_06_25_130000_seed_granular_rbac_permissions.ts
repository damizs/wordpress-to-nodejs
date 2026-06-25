import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Permissões dedicadas para Atas, Pautas e Contratos (granularidade RBAC).
 * Antes, as rotas admin de atas/pautas usavam `sessao.gerenciar` e contratos
 * `licitacao.gerenciar`. Esta migration semeia as 3 permissões novas e as
 * vincula ao papel `administrador` — para valer em produção sem reseed.
 *
 * Idempotente: só insere se ausente (ON CONFLICT no name único) e só vincula
 * pares (role_id, permission_id) ainda não existentes.
 */
export default class extends BaseSchema {
  private permissions = [
    { name: 'ata.gerenciar', label: 'Atas', module: 'Legislativo' },
    { name: 'pauta.gerenciar', label: 'Pautas', module: 'Legislativo' },
    { name: 'contrato.gerenciar', label: 'Contratos', module: 'Transparência' },
  ]

  async up() {
    // Sem tabelas RBAC (ambiente legado) → nada a fazer.
    if (!(await this.schema.hasTable('permissions'))) return
    if (!(await this.schema.hasTable('roles'))) return
    if (!(await this.schema.hasTable('role_permissions'))) return

    // 1. Insere as permissões ausentes (name é UNIQUE).
    for (const p of this.permissions) {
      await this.db.rawQuery(
        `INSERT INTO permissions (name, label, module, created_at, updated_at)
         VALUES (?, ?, ?, NOW(), NOW())
         ON CONFLICT (name) DO NOTHING`,
        [p.name, p.label, p.module]
      )
    }

    // 2. Vincula ao papel administrador (idempotente via unique role_id+permission_id).
    await this.db.rawQuery(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT r.id, p.id
       FROM roles r
       CROSS JOIN permissions p
       WHERE r.slug = 'administrador'
         AND p.name IN (?, ?, ?)
       ON CONFLICT (role_id, permission_id) DO NOTHING`,
      this.permissions.map((p) => p.name)
    )
  }

  async down() {
    if (!(await this.schema.hasTable('permissions'))) return
    await this.db.rawQuery(`DELETE FROM permissions WHERE name IN (?, ?, ?)`, [
      'ata.gerenciar',
      'pauta.gerenciar',
      'contrato.gerenciar',
    ])
    // role_permissions some por cascata (FK onDelete CASCADE).
  }
}
