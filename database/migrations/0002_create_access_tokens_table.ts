import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.integer('tokenable_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      t.string('type').notNullable()
      t.string('name').nullable()
      t.string('hash').notNullable()
      t.text('abilities').notNullable()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
      t.timestamp('last_used_at').nullable()
      t.timestamp('expires_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
