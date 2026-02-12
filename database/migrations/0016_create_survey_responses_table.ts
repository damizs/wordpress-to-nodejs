import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'survey_responses'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.integer('question_id').unsigned().references('id').inTable('survey_questions').onDelete('CASCADE')
      t.integer('rating').notNullable()
      t.text('comment').nullable()
      t.string('ip_address').nullable()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
