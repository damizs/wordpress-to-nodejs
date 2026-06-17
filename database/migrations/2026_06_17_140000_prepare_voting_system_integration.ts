import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Campos de preparação para integração com sistema de votação/protocolo.
 * A API ainda será definida com o fornecedor, mas estes campos permitem mapear
 * registros externos sem remodelar sessões, matérias e votações depois.
 */
export default class extends BaseSchema {
  async up() {
    const plenaryHasExternalId = await this.schema.hasColumn('plenary_sessions', 'voting_system_id')
    if (!plenaryHasExternalId) {
      this.schema.alterTable('plenary_sessions', (table) => {
        table.string('voting_system_id').nullable()
        table.string('voting_system_url').nullable()
        table.timestamp('synced_at').nullable()
        table.index(['voting_system_id'])
      })
    }

    const activitiesHasExternalId = await this.schema.hasColumn('legislative_activities', 'voting_system_id')
    if (!activitiesHasExternalId) {
      this.schema.alterTable('legislative_activities', (table) => {
        table.string('voting_system_id').nullable()
        table.string('voting_system_url').nullable()
        table.json('tramitation_steps').nullable()
        table.timestamp('synced_at').nullable()
        table.index(['voting_system_id'])
      })
    }

    const votingsHasExternalId = await this.schema.hasColumn('nominal_votings', 'voting_system_id')
    if (!votingsHasExternalId) {
      this.schema.alterTable('nominal_votings', (table) => {
        table.string('voting_system_id').nullable()
        table.string('voting_system_url').nullable()
        table.timestamp('synced_at').nullable()
        table.index(['voting_system_id'])
      })
    }
  }

  async down() {
    if (await this.schema.hasColumn('plenary_sessions', 'voting_system_id')) {
      this.schema.alterTable('plenary_sessions', (table) => {
        table.dropIndex(['voting_system_id'])
        table.dropColumn('voting_system_id')
        table.dropColumn('voting_system_url')
        table.dropColumn('synced_at')
      })
    }

    if (await this.schema.hasColumn('legislative_activities', 'voting_system_id')) {
      this.schema.alterTable('legislative_activities', (table) => {
        table.dropIndex(['voting_system_id'])
        table.dropColumn('voting_system_id')
        table.dropColumn('voting_system_url')
        table.dropColumn('tramitation_steps')
        table.dropColumn('synced_at')
      })
    }

    if (await this.schema.hasColumn('nominal_votings', 'voting_system_id')) {
      this.schema.alterTable('nominal_votings', (table) => {
        table.dropIndex(['voting_system_id'])
        table.dropColumn('voting_system_id')
        table.dropColumn('voting_system_url')
        table.dropColumn('synced_at')
      })
    }
  }
}
