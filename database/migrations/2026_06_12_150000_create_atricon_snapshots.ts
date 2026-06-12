import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'atricon_snapshots'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // Índice geral estimado (0–100, 1 casa decimal) no momento do snapshot
      table.decimal('index', 5, 1).notNullable()
      table.string('level', 30).notNullable()
      // Percentual por dimensão e totais por status — para os gráficos de evolução
      table.jsonb('dimensions').nullable()
      table.jsonb('totals').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
