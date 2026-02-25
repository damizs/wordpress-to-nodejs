import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'instagram_imports'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Dados do Instagram
      table.string('instagram_id', 255).notNullable().unique()
      table.string('instagram_url', 500).notNullable()
      table.text('instagram_caption').nullable()
      table.string('instagram_image_url', 500).nullable()
      table.timestamp('instagram_post_date').nullable()
      table.string('instagram_shortcode', 50).nullable()
      
      // Dados gerados pela IA
      table.string('generated_title', 255).nullable()
      table.text('generated_content').nullable()
      table.string('ai_provider', 50).nullable()
      table.string('ai_model', 100).nullable()
      table.integer('ai_tokens_used').defaultTo(0)
      
      // Relação com notícias
      table.integer('news_id').unsigned().nullable().references('id').inTable('news').onDelete('SET NULL')
      table.string('import_status', 50).defaultTo('pending') // pending, processing, published, failed
      
      // Metadados
      table.integer('imported_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.float('processing_time').nullable()
      table.text('error_message').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
