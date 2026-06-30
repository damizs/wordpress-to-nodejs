import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Glossário legislativo — termos jurídicos/orçamentários com suas definições
 * (importados do glossário do site WordPress antigo).
 *
 * Idempotente: só cria a tabela se ainda não existir (hasTable), para não
 * quebrar em re-execuções do `migration:run --force` do boot.
 */
export default class extends BaseSchema {
  protected tableName = 'glossary_terms'

  async up() {
    const exists = await this.schema.hasTable(this.tableName)
    if (exists) return

    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('term', 300).notNullable() // verbete
      t.text('definition').notNullable() // definição
      t.string('letter', 1).nullable() // letra inicial normalizada (A–Z)
      t.string('slug').nullable()
      t.integer('display_order').defaultTo(0)
      t.boolean('is_active').defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()

      t.index(['letter'])
      t.index(['is_active'])
    })
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
