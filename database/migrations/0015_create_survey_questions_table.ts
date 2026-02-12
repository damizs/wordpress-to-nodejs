import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'survey_questions'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('question').notNullable()
      t.boolean('is_active').defaultTo(true)
      t.integer('display_order').defaultTo(0)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
