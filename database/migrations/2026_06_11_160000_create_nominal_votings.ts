import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('nominal_votings', (table) => {
      table.increments('id')
      table.string('title', 500).notNullable()
      table.text('description').nullable()
      table
        .integer('plenary_session_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('plenary_sessions')
        .onDelete('SET NULL')
      table
        .integer('legislative_activity_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('legislative_activities')
        .onDelete('SET NULL')
      table.date('voting_date').notNullable()
      table.integer('year').notNullable()
      table
        .enum('result', ['aprovado', 'rejeitado', 'retirado', 'adiado', 'outro'])
        .notNullable()
        .defaultTo('aprovado')
      table.boolean('is_unanimous').notNullable().defaultTo(false)
      table.boolean('is_published').notNullable().defaultTo(false)
      // Origem do registro: cadastro manual, extração da ata via IA ou sistema de votação (API)
      table.enum('source', ['manual', 'ata_ia', 'api']).notNullable().defaultTo('manual')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['year', 'is_published'])
    })

    this.schema.createTable('nominal_voting_entries', (table) => {
      table.increments('id')
      table
        .integer('nominal_voting_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('nominal_votings')
        .onDelete('CASCADE')
      table
        .integer('councilor_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('councilors')
        .onDelete('SET NULL')
      // Snapshot do nome: preserva o registro histórico mesmo se o vereador for removido
      table.string('councilor_name', 255).notNullable()
      table.string('party', 50).nullable()
      table
        .enum('vote', ['sim', 'nao', 'abstencao', 'ausente', 'nao_votou'])
        .notNullable()
        .defaultTo('sim')
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable('nominal_voting_entries')
    this.schema.dropTable('nominal_votings')
  }
}
