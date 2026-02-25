import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'instagram_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Configurações do Instagram
      table.string('instagram_profile_url', 500).nullable()
      table.string('rapidapi_key', 255).nullable()
      table.text('instagram_sessionid').nullable()
      table.text('instagram_useragent').nullable()
      
      // Configurações de IA
      table.string('ai_provider', 50).defaultTo('gemini') // openai, claude, gemini
      table.string('ai_api_key', 255).nullable()
      table.string('ai_model', 100).defaultTo('gemini-2.0-flash')
      table.text('ai_prompt').nullable()
      
      // Configurações de importação
      table.boolean('auto_import_enabled').defaultTo(false)
      table.string('cron_mode', 20).defaultTo('daily') // daily, test
      table.integer('cron_hour').defaultTo(19)
      table.integer('cron_minute').defaultTo(0)
      table.integer('auto_import_limit').defaultTo(5)
      table.string('default_status', 20).defaultTo('published') // published, draft
      table.integer('default_category_id').unsigned().nullable()
      table.boolean('download_images').defaultTo(true)
      table.boolean('prevent_duplicates').defaultTo(true)
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
