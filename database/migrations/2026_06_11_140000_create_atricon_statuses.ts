import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'atricon_statuses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('criterion_code', 10).notNullable().unique()
      table
        .enum('status', ['atendido', 'parcial', 'pendente', 'externo', 'nao_se_aplica'])
        .notNullable()
        .defaultTo('pendente')
      table.string('evidence_url', 500).nullable()
      table.text('notes').nullable()
      table.integer('updated_by').unsigned().nullable().references('id').inTable('users')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
