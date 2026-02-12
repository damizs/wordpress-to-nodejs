import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'faq_items'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('question').notNullable()
      t.text('answer').notNullable()
      t.string('category').notNullable() // LAI, transparencia, sessões, participação, sobre a camara
      t.integer('display_order').defaultTo(0)
      t.boolean('is_active').defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
