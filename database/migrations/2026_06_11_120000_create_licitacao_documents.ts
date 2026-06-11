import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licitacao_documents'

  async up() {
    const exists = await this.schema.hasTable(this.tableName)
    if (exists) return

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('licitacao_id')
        .unsigned()
        .references('id')
        .inTable('licitacoes')
        .onDelete('CASCADE')
        .notNullable()
      // Fase do processo: edital, dfd, etp, pesquisa_mercado, projeto_basico,
      // autorizacao, proposta, contrato, documentacao, outros
      table.string('document_type').notNullable().defaultTo('outros')
      table.string('title').notNullable()
      table.string('file_url').notNullable()
      table.integer('display_order').notNullable().defaultTo(0)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['licitacao_id', 'document_type'])
    })
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
