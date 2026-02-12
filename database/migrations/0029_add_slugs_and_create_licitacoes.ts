import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Add slug to legislative_activities
    this.schema.alterTable('legislative_activities', (t) => {
      t.string('slug', 255).nullable().unique()
      t.string('title', 500).nullable()
      t.boolean('is_active').defaultTo(true)
    })

    // Add slug to plenary_sessions
    this.schema.alterTable('plenary_sessions', (t) => {
      t.string('slug', 255).nullable().unique()
    })

    // Add slug to official_publications
    this.schema.alterTable('official_publications', (t) => {
      t.string('slug', 255).nullable().unique()
    })

    // Create licitacoes table
    this.schema.createTable('licitacoes', (t) => {
      t.increments('id')
      t.string('title', 500).notNullable()
      t.string('slug', 255).notNullable().unique()
      t.string('number', 50).nullable()
      t.string('modality', 100).nullable() // pregao, tomada_precos, concorrencia, convite, dispensa, inexigibilidade
      t.string('status', 50).defaultTo('aberta') // aberta, em_andamento, encerrada, deserta, revogada, suspensa
      t.text('object').nullable() // objeto da licitação
      t.text('content').nullable()
      t.decimal('estimated_value', 14, 2).nullable()
      t.date('opening_date').nullable()
      t.date('closing_date').nullable()
      t.integer('year').nullable()
      t.string('file_url').nullable()
      t.boolean('is_active').defaultTo(true)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTableIfExists('licitacoes')
    this.schema.alterTable('official_publications', (t) => {
      t.dropColumn('slug')
    })
    this.schema.alterTable('plenary_sessions', (t) => {
      t.dropColumn('slug')
    })
    this.schema.alterTable('legislative_activities', (t) => {
      t.dropColumn('slug')
      t.dropColumn('title')
      t.dropColumn('is_active')
    })
  }
}
