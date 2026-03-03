import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'instagram_import_logs'

  async up() {
    // Drop if exists
    this.schema.dropTableIfExists(this.tableName)
    
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Instagram data
      table.string('instagram_id', 100).notNullable()
      table.string('instagram_shortcode', 100).nullable()
      table.string('instagram_url', 500).nullable()
      table.text('instagram_caption').nullable()
      table.string('instagram_image_url', 1000).nullable()
      table.timestamp('instagram_post_date').nullable()
      
      // Generated content
      table.string('generated_title', 500).nullable()
      table.text('generated_content').nullable()
      
      // AI info
      table.string('ai_provider', 50).nullable()
      table.string('ai_model', 100).nullable()
      table.integer('ai_tokens_used').defaultTo(0)
      
      // Relations
      table.integer('news_id').unsigned().nullable()
        .references('id').inTable('news').onDelete('SET NULL')
      table.integer('category_id').unsigned().nullable()
      table.integer('image_id').unsigned().nullable()
      table.integer('imported_by').unsigned().nullable()
        .references('id').inTable('users').onDelete('SET NULL')
      
      // Status
      table.enum('status', ['pending', 'published', 'draft', 'error']).defaultTo('pending')
      table.integer('processing_time').nullable()
      table.text('error_message').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      // Indexes
      table.index('instagram_id')
      table.index('status')
      table.index('created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
