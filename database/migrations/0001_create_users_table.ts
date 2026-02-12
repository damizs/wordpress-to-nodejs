import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('full_name').notNullable()
      t.string('email').notNullable().unique()
      t.string('password').notNullable()
      t.enum('role', ['super_admin', 'admin', 'editor', 'viewer']).defaultTo('viewer')
      t.boolean('is_active').defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
