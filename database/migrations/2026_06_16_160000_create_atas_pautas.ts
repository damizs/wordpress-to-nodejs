import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Atas e Pautas como módulos INDEPENDENTES (espelhando o WordPress, onde eram
 * conteúdos separados). Antes ambas viviam acopladas em `plenary_sessions`
 * (campos `minutes` e `agenda`). Agora cada uma tem sua própria tabela/CRUD.
 * Estrutura idêntica entre as duas: documento oficial (título, data, tipo,
 * conteúdo textual e PDF para download).
 */
export default class extends BaseSchema {
  async up() {
    for (const tableName of ['atas', 'pautas']) {
      this.schema.createTable(tableName, (t) => {
        t.increments('id')
        t.string('title', 300).notNullable()
        t.string('slug').notNullable().unique()
        // Tipo de sessão: ordinaria | extraordinaria | solene | especial
        t.string('type', 20).notNullable().defaultTo('ordinaria')
        t.date('document_date').notNullable()
        t.integer('year').nullable()
        t.string('doc_time', 10).nullable()
        t.text('content', 'longtext').nullable() // conteúdo textual (documento oficial)
        t.string('file_url').nullable() // PDF para download
        t.boolean('is_published').defaultTo(true)
        t.integer('display_order').defaultTo(0)
        t.timestamp('created_at').notNullable()
        t.timestamp('updated_at').nullable()

        t.index(['year'])
        t.index(['type'])
      })
    }
  }

  async down() {
    this.schema.dropTableIfExists('pautas')
    this.schema.dropTableIfExists('atas')
  }
}
