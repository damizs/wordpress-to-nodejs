import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'legislative_activity_authors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('legislative_activity_id')
        .unsigned()
        .references('id')
        .inTable('legislative_activities')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('councilor_id')
        .unsigned()
        .references('id')
        .inTable('councilors')
        .onDelete('CASCADE')
        .notNullable()
      table.unique(['legislative_activity_id', 'councilor_id'])
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
