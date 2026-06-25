import { BaseSchema } from '@adonisjs/lucid/schema'
import { hashCpf } from '#helpers/cpf_hash'

export default class extends BaseSchema {
  protected tableName = 'satisfaction_surveys'

  async up() {
    const hasHash = await this.schema.hasColumn(this.tableName, 'cpf_hash')
    if (!hasHash) {
      this.schema.alterTable(this.tableName, (table) => {
        table.string('cpf_hash', 64).nullable()
      })
    }

    this.defer(async (db) => {
      const hasCpf = await db
        .from('information_schema.columns')
        .where('table_schema', 'public')
        .where('table_name', this.tableName)
        .where('column_name', 'cpf')
        .first()

      if (!hasCpf) return

      const rows = await db.from(this.tableName).select('id', 'cpf').whereNotNull('cpf')
      for (const row of rows) {
        if (!row.cpf) continue
        await db.from(this.tableName).where('id', row.id).update({ cpf_hash: hashCpf(row.cpf) })
      }

      await db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS cpf`)
    })
  }

  async down() {
    const hasCpf = await this.schema.hasColumn(this.tableName, 'cpf')
    if (!hasCpf) {
      this.schema.alterTable(this.tableName, (table) => {
        table.string('cpf', 14).nullable()
      })
    }

    const hasHash = await this.schema.hasColumn(this.tableName, 'cpf_hash')
    if (hasHash) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('cpf_hash')
      })
    }
  }
}
