import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'seals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.string('image_url', 500).nullable()
      table.string('link_url', 500).nullable()
      table.integer('sort_order').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
