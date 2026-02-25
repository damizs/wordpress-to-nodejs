import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'instagram_import_settings'
  protected logsTableName = 'instagram_import_logs'

  async up() {
    // Tabela de configurações
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('key', 100).notNullable().unique()
      table.text('value').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    // Tabela de logs de importação
    this.schema.createTable(this.logsTableName, (table) => {
      table.increments('id')
      table.string('instagram_id', 255).notNullable().unique()
      table.string('instagram_shortcode', 100).nullable()
      table.string('instagram_url', 500).nullable()
      table.text('instagram_caption').nullable()
      table.string('instagram_image_url', 500).nullable()
      table.timestamp('instagram_post_date').nullable()
      
      table.string('generated_title', 255).nullable()
      table.text('generated_content').nullable()
      
      table.string('ai_provider', 50).nullable()
      table.string('ai_model', 100).nullable()
      table.integer('ai_tokens_used').defaultTo(0)
      
      table.integer('news_id').unsigned().references('id').inTable('news').onDelete('SET NULL')
      table.string('status', 50).defaultTo('pending') // pending, published, draft, error
      table.integer('category_id').unsigned().nullable()
      table.integer('image_id').unsigned().nullable()
      
      table.float('processing_time').nullable()
      table.text('error_message').nullable()
      
      table.integer('imported_by').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      table.index(['status'])
      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.logsTableName)
    this.schema.dropTable(this.tableName)
  }
}
