import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'official_gazette_entries'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('edition_number').notNullable()
      t.date('publication_date').notNullable()
      t.text('description').nullable()
      t.string('file_url').nullable()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
