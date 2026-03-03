import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'instagram_settings'

  async up() {
    // Drop if exists (key-value format)
    this.schema.dropTableIfExists(this.tableName)
    
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('key', 100).notNullable().unique()
      table.text('value').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
