import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'institutional_content'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('key').notNullable().unique()
      t.string('title').notNullable()
      t.text('content').notNullable()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
