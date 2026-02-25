import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'instagram_imports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Instagram data
      table.string('instagram_id', 255).notNullable().unique()
      table.string('instagram_url', 500).notNullable()
      table.text('instagram_caption').nullable()
      table.string('instagram_image_url', 500).nullable()
      table.timestamp('instagram_post_date').nullable()
      
      // Generated content
      table.string('generated_title', 255).nullable()
      table.text('generated_content').nullable()
      
      // AI info
      table.string('ai_provider', 50).nullable()
      table.string('ai_model', 100).nullable()
      table.integer('ai_tokens_used').defaultTo(0)
      
      // News reference
      table.integer('news_id').unsigned().references('id').inTable('news').onDelete('SET NULL').nullable()
      table.string('news_status', 50).nullable()
      table.integer('category_id').unsigned().nullable()
      table.integer('image_id').unsigned().nullable()
      
      // Import info
      table.timestamp('imported_at').notNullable()
      table.integer('imported_by').unsigned().nullable()
      table.float('processing_time').nullable()
      table.text('error_message').nullable()
      table.boolean('is_auto_import').defaultTo(false)
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
