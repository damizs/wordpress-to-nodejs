import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fiscal_reports'

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      // Tipo de relatório: RGF (Relatório de Gestão Fiscal) | RREO | outros.
      t.string('report_type', 20).notNullable().defaultTo('RGF')
      t.integer('year').notNullable()
      // Granularidade do período (varia por câmara): bimestre | trimestre |
      // quadrimestre | semestre | anual.
      t.string('period_kind', 20).notNullable().defaultTo('quadrimestre')
      // Número do período (1º, 2º...). Nulo quando period_kind = 'anual'.
      t.integer('period_number').nullable()
      t.string('title', 300).nullable() // gerado automaticamente se vazio
      t.text('description').nullable()
      t.string('file_url').nullable() // PDF do relatório/anexos
      t.boolean('is_active').defaultTo(true)
      t.integer('display_order').defaultTo(0)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()

      t.index(['report_type'])
      t.index(['year'])
    })
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
