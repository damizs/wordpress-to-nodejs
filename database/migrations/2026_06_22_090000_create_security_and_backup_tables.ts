import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected securityTable = 'security_events'
  protected backupTable = 'backup_runs'

  async up() {
    this.schema.createTable(this.securityTable, (table) => {
      table.increments('id')
      table.string('level', 30).notNullable().defaultTo('info')
      table.string('type', 80).notNullable()
      table.string('action', 40).notNullable().defaultTo('observe')
      table.string('ip', 80).nullable()
      table.string('method', 20).nullable()
      table.text('path').nullable()
      table.text('user_agent').nullable()
      table.text('message').nullable()
      table.jsonb('metadata').nullable()
      table.timestamp('created_at')

      table.index(['created_at'])
      table.index(['type'])
      table.index(['ip'])
    })

    this.schema.createTable(this.backupTable, (table) => {
      table.increments('id')
      table.string('status', 30).notNullable().defaultTo('running')
      table.string('trigger', 40).notNullable().defaultTo('manual')
      table.timestamp('started_at').nullable()
      table.timestamp('finished_at').nullable()
      table.text('local_path').nullable()
      table.text('database_path').nullable()
      table.text('uploads_path').nullable()
      table.bigInteger('size_bytes').notNullable().defaultTo(0)
      table.jsonb('providers').nullable()
      table.text('logs').nullable()
      table.text('error').nullable()
      table.timestamps(true, true)

      table.index(['status'])
      table.index(['started_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.backupTable)
    this.schema.dropTable(this.securityTable)
  }
}
