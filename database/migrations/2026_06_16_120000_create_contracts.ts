import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contracts'

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('number', 50).nullable() // nº do contrato (ex.: 012/2025)
      t.integer('year').nullable()
      t.string('slug', 255).notNullable().unique()
      t.text('object').nullable() // objeto do contrato
      t.string('contractor_name', 300).nullable() // contratado (empresa/pessoa)
      t.string('contractor_document', 40).nullable() // CNPJ/CPF
      t.decimal('value', 14, 2).nullable() // valor global
      t.string('modality', 100).nullable() // Dispensa | Inexigibilidade | Pregão | Concorrência...
      t.string('legal_basis', 200).nullable() // base legal (ex.: Art. 75, II, Lei 14.133/21)
      t.date('sign_date').nullable() // data de assinatura
      t.date('start_date').nullable() // início da vigência
      t.date('end_date').nullable() // fim da vigência
      t.string('term', 100).nullable() // vigência textual (ex.: "12 meses")
      t.string('status', 50).defaultTo('vigente') // vigente | encerrado | rescindido | suspenso
      // Gestor do contrato (autoridade responsável)
      t.string('manager_name', 300).nullable()
      t.string('manager_role', 200).nullable() // cargo do gestor (ex.: Presidente da Câmara)
      // Fiscal técnico do contrato (PNTP 9.3)
      t.string('fiscal_name', 300).nullable() // nome do fiscal do contrato
      t.string('fiscal_role', 200).nullable() // cargo do fiscal (ex.: Chefe de Gabinete)
      t.string('fiscal_act', 200).nullable() // portaria/ato de designação do fiscal
      t
        .integer('licitacao_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('licitacoes')
        .onDelete('SET NULL')
      t.string('file_url').nullable() // PDF do inteiro teor
      t.text('content').nullable() // texto/observações longas
      t.text('notes').nullable()
      t.boolean('is_active').defaultTo(true)
      t.integer('display_order').defaultTo(0)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()

      t.index(['year'])
      t.index(['status'])
    })
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
