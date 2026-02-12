import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'system_categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('type', 50).notNullable() // 'faq', 'information_record', 'publication', 'session_type'
      table.string('name', 100).notNullable()
      table.string('slug', 120).notNullable()
      table.integer('display_order').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['type', 'slug'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
