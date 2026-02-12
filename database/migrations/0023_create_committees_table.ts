import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'committees'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('name').notNullable()
      t.string('slug').notNullable().unique()
      t.text('description').nullable()
      t.enum('type', ['permanente', 'temporaria', 'especial']).defaultTo('permanente')
      t.integer('legislature_id').unsigned().references('id').inTable('legislatures').onDelete('SET NULL').nullable()
      t.boolean('is_active').defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
