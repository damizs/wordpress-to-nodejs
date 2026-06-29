import { BaseSchema } from '@adonisjs/lucid/schema'

const SOFT_DELETE_TABLES = [
  'news',
  'atas',
  'pautas',
  'legislative_activities',
  'official_publications',
  'transparency_sections',
  'transparency_links',
  'information_records',
  'pages',
  'media_files',
  'faq_items',
  'plenary_sessions',
  'nominal_votings',
]

const PERMISSIONS = [
  {
    name: 'papel.gerenciar',
    label: 'Papéis e permissões',
    module: 'Sistema',
  },
  {
    name: 'seguranca.gerenciar',
    label: 'Segurança, backups e lixeira',
    module: 'Sistema',
  },
]

export default class extends BaseSchema {
  async up() {
    if (await this.schema.hasTable('users')) {
      if (!(await this.schema.hasColumn('users', 'last_login_at'))) {
        this.schema.alterTable('users', (table) => {
          table.timestamp('last_login_at', { useTz: true }).nullable()
        })
      }

      if (!(await this.schema.hasColumn('users', 'last_login_ip'))) {
        this.schema.alterTable('users', (table) => {
          table.string('last_login_ip', 80).nullable()
        })
      }
    }

    if (!(await this.schema.hasTable('activity_logs'))) {
      this.schema.createTable('activity_logs', (table) => {
        table.increments('id')
        table
          .integer('user_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('users')
          .onDelete('SET NULL')
        table.string('action', 80).notNullable()
        table.string('resource', 120).notNullable()
        table.string('resource_id', 120).nullable()
        table.string('method', 16).nullable()
        table.string('path', 500).nullable()
        table.string('ip', 80).nullable()
        table.text('user_agent').nullable()
        table.integer('status_code').nullable()
        table.text('message').nullable()
        table.jsonb('metadata').nullable()
        table.timestamp('created_at', { useTz: true }).notNullable()

        table.index(['user_id'])
        table.index(['created_at'])
        table.index(['resource', 'action'])
      })
    }

    if (!(await this.schema.hasTable('trash_entries'))) {
      this.schema.createTable('trash_entries', (table) => {
        table.increments('id')
        table.string('table_name', 120).notNullable()
        table.string('record_id', 120).notNullable()
        table.string('display_name', 255).nullable()
        table.jsonb('data').notNullable()
        table
          .integer('deleted_by_user_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('users')
          .onDelete('SET NULL')
        table.timestamp('deleted_at', { useTz: true }).notNullable()
        table
          .integer('restored_by_user_id')
          .unsigned()
          .nullable()
          .references('id')
          .inTable('users')
          .onDelete('SET NULL')
        table.timestamp('restored_at', { useTz: true }).nullable()
        table.jsonb('metadata').nullable()
        table.timestamp('created_at', { useTz: true }).notNullable()
        table.timestamp('updated_at', { useTz: true }).nullable()

        table.index(['table_name', 'record_id'])
        table.index(['deleted_at'])
        table.index(['restored_at'])
      })
    }

    if (!(await this.schema.hasTable('storage_sync_runs'))) {
      this.schema.createTable('storage_sync_runs', (table) => {
        table.increments('id')
        table.string('status', 30).notNullable()
        table.string('trigger', 30).notNullable()
        table.string('local_path', 1000).notNullable()
        table.string('target', 1000).notNullable()
        table.timestamp('started_at', { useTz: true }).notNullable()
        table.timestamp('finished_at', { useTz: true }).nullable()
        table.integer('files_scanned').nullable()
        table.integer('files_synced').nullable()
        table.bigInteger('bytes_synced').nullable()
        table.text('logs').nullable()
        table.text('error').nullable()
        table.timestamp('created_at', { useTz: true }).notNullable()
        table.timestamp('updated_at', { useTz: true }).nullable()

        table.index(['status'])
        table.index(['started_at'])
      })
    }

    for (const tableName of SOFT_DELETE_TABLES) {
      if ((await this.schema.hasTable(tableName)) && !(await this.schema.hasColumn(tableName, 'deleted_at'))) {
        this.schema.alterTable(tableName, (table) => {
          table.timestamp('deleted_at', { useTz: true }).nullable()
          table.index(['deleted_at'])
        })
      }
    }

    if (await this.schema.hasTable('permissions')) {
      for (const permission of PERMISSIONS) {
        await this.db.rawQuery(
          `INSERT INTO permissions (name, label, module, created_at, updated_at)
           VALUES (?, ?, ?, NOW(), NOW())
           ON CONFLICT (name) DO NOTHING`,
          [permission.name, permission.label, permission.module]
        )
      }

      if ((await this.schema.hasTable('roles')) && (await this.schema.hasTable('role_permissions'))) {
        await this.db.rawQuery(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT r.id, p.id
           FROM roles r
           CROSS JOIN permissions p
           WHERE r.slug = 'administrador'
             AND p.name = 'seguranca.gerenciar'
           ON CONFLICT (role_id, permission_id) DO NOTHING`
        )
      }
    }
  }

  async down() {
    if (await this.schema.hasTable('permissions')) {
      for (const permission of PERMISSIONS) {
        await this.db.from('permissions').where('name', permission.name).delete()
      }
    }

    for (const tableName of SOFT_DELETE_TABLES) {
      if ((await this.schema.hasTable(tableName)) && (await this.schema.hasColumn(tableName, 'deleted_at'))) {
        this.schema.alterTable(tableName, (table) => {
          table.dropColumn('deleted_at')
        })
      }
    }

    this.schema.dropTableIfExists('storage_sync_runs')
    this.schema.dropTableIfExists('trash_entries')
    this.schema.dropTableIfExists('activity_logs')

    if (await this.schema.hasTable('users')) {
      if (await this.schema.hasColumn('users', 'last_login_ip')) {
        this.schema.alterTable('users', (table) => {
          table.dropColumn('last_login_ip')
        })
      }

      if (await this.schema.hasColumn('users', 'last_login_at')) {
        this.schema.alterTable('users', (table) => {
          table.dropColumn('last_login_at')
        })
      }
    }
  }
}
