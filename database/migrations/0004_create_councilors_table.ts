import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'councilors'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('name').notNullable()
      t.string('slug').notNullable().unique()
      t.string('party').nullable()
      t.string('photo_url').nullable()
      t.string('email').nullable()
      t.string('phone').nullable()
      t.text('bio').nullable()
      t.string('role').nullable()
      t.boolean('is_active').defaultTo(true)
      t.integer('legislature_id').unsigned().references('id').inTable('legislatures').onDelete('SET NULL').nullable()
      t.integer('display_order').defaultTo(0)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
