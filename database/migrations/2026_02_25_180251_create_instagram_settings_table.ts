import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'instagram_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Instagram config
      table.string('instagram_profile_url', 500).nullable()
      table.string('instagram_sessionid', 500).nullable()
      table.string('instagram_useragent', 500).nullable()
      table.string('rapidapi_key', 500).nullable()
      
      // AI config
      table.enum('ai_provider', ['openai', 'claude', 'gemini']).defaultTo('gemini')
      table.string('ai_api_key', 500).nullable()
      table.string('ai_model', 100).defaultTo('gemini-2.0-flash')
      table.text('ai_prompt').nullable()
      
      // Publishing defaults
      table.integer('default_category_id').unsigned().nullable()
      table.enum('default_status', ['draft', 'published']).defaultTo('draft')
      table.boolean('download_images').defaultTo(true)
      table.boolean('prevent_duplicates').defaultTo(true)
      
      // Auto import config
      table.boolean('auto_import_enabled').defaultTo(false)
      table.enum('auto_import_interval', ['30min', '1hour', '6hours', '12hours', 'daily']).defaultTo('daily')
      table.integer('auto_import_limit').defaultTo(5)
      table.string('cron_time', 10).defaultTo('08:00') // HH:MM
      table.boolean('import_only_today').defaultTo(true)
      
      // Last run info
      table.timestamp('last_import_at').nullable()
      table.integer('last_import_count').defaultTo(0)
      table.text('last_import_error').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
