import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'legislative_activities'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('type').notNullable()
      t.string('number').notNullable()
      t.integer('year').notNullable()
      t.text('summary').notNullable()
      t.text('content').nullable()
      t.enum('status', ['tramitando', 'aprovado', 'rejeitado', 'arquivado']).defaultTo('tramitando')
      t.string('author').nullable()
      t.string('file_url').nullable()
      t.date('session_date').nullable()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
