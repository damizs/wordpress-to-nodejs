import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'transparency_sections'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('title').notNullable()
      t.string('slug').notNullable().unique()
      t.string('icon').nullable()
      t.text('description').nullable()
      t.integer('display_order').defaultTo(0)
      t.boolean('is_active').defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
