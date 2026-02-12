import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transparency_links'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.integer('section_id').unsigned().references('id').inTable('transparency_sections').onDelete('CASCADE')
      t.string('title').notNullable()
      t.string('url').notNullable()
      t.string('icon').nullable()
      t.integer('display_order').defaultTo(0)
      t.boolean('is_external').defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
