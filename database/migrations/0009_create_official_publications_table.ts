import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'official_publications'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('title').notNullable()
      t.string('type').notNullable()
      t.string('number').nullable()
      t.date('publication_date').notNullable()
      t.string('file_url').nullable()
      t.text('description').nullable()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
