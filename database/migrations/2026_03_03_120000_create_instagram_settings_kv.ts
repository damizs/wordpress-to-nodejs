import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'instagram_settings'

  async up() {
    // Drop if exists with different structure
    const hasTable = await this.schema.hasTable(this.tableName)
    if (hasTable) {
      const hasKeyColumn = await this.schema.hasColumn(this.tableName, 'key')
      if (!hasKeyColumn) {
        // Old structure - drop and recreate
        this.schema.dropTable(this.tableName)
      } else {
        // Already correct structure
        return
      }
    }
    
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
