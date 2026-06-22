import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('channel', 40).notNullable().defaultTo('evolution')
      table.string('type', 80).notNullable()
      table.string('status', 30).notNullable().defaultTo('pending')
      table.string('recipient', 120).nullable()
      table.string('dedupe_key', 180).nullable()
      table.text('message').nullable()
      table.text('error').nullable()
      table.jsonb('metadata').nullable()
      table.timestamp('sent_at').nullable()
      table.timestamps(true, true)

      table.index(['channel', 'type'])
      table.index(['status'])
      table.index(['dedupe_key'])
      table.index(['sent_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
