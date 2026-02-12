import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plenary_sessions'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('title').notNullable()
      t.enum('type', ['ordinaria', 'extraordinaria', 'solene', 'especial']).defaultTo('ordinaria')
      t.date('session_date').notNullable()
      t.time('start_time').nullable()
      t.enum('status', ['agendada', 'realizada', 'cancelada']).defaultTo('agendada')
      t.text('agenda').nullable()
      t.text('minutes').nullable()
      t.string('video_url').nullable()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
