import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'biennia'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('name').notNullable() // "2025/2026"
      t.integer('legislature_id').unsigned().references('id').inTable('legislatures').onDelete('CASCADE').notNullable()
      t.date('start_date').notNullable()
      t.date('end_date').notNullable()
      t.boolean('is_current').defaultTo(false)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
