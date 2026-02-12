import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'news_categories'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('name').notNullable()
      t.string('slug').notNullable().unique()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
