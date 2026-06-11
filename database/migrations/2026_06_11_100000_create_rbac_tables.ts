import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    if (!(await this.schema.hasTable('roles'))) {
      this.schema.createTable('roles', (t) => {
        t.increments('id')
        t.string('name').notNullable().unique()
        t.string('slug').notNullable().unique()
        t.string('description').nullable()
        t.boolean('is_system').notNullable().defaultTo(false)
        t.timestamps(true, true)
      })
    }

    if (!(await this.schema.hasTable('permissions'))) {
      this.schema.createTable('permissions', (t) => {
        t.increments('id')
        t.string('name').notNullable().unique() // recurso.acao (ex: noticia.publicar)
        t.string('label').notNullable()
        t.string('module').notNullable() // agrupamento na UI
        t.timestamps(true, true)
      })
    }

    if (!(await this.schema.hasTable('role_permissions'))) {
      this.schema.createTable('role_permissions', (t) => {
        t.increments('id')
        t.integer('role_id').unsigned().references('roles.id').onDelete('CASCADE').notNullable()
        t.integer('permission_id')
          .unsigned()
          .references('permissions.id')
          .onDelete('CASCADE')
          .notNullable()
        t.unique(['role_id', 'permission_id'])
      })
    }

    if (!(await this.schema.hasTable('user_roles'))) {
      this.schema.createTable('user_roles', (t) => {
        t.increments('id')
        t.integer('user_id').unsigned().references('users.id').onDelete('CASCADE').notNullable()
        t.integer('role_id').unsigned().references('roles.id').onDelete('CASCADE').notNullable()
        t.unique(['user_id', 'role_id'])
      })
    }
  }

  async down() {
    this.schema.dropTableIfExists('user_roles')
    this.schema.dropTableIfExists('role_permissions')
    this.schema.dropTableIfExists('permissions')
    this.schema.dropTableIfExists('roles')
  }
}
