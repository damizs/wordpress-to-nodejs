import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'legislatures'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('name').notNullable()
      t.integer('number').notNullable()
      t.date('start_date').notNullable()
      t.date('end_date').notNullable()
      t.boolean('is_current').defaultTo(false)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
