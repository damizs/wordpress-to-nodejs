import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'legislative_activities'

  async up() {
    const hasColumn = await this.schema.hasColumn(this.tableName, 'origin')
    if (!hasColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.string('origin', 30).notNullable().defaultTo('nao_informado')
      })
    }

    this.defer(async (db) => {
      await db.rawQuery(`
        UPDATE ${this.tableName}
        SET origin = CASE
          WHEN lower(
            coalesce(author, '') || ' ' ||
            coalesce(title, '') || ' ' ||
            coalesce(summary, '') || ' ' ||
            coalesce(content, '')
          ) LIKE '%poder executivo%'
            OR lower(coalesce(author, '')) LIKE '%prefeito%'
            OR lower(coalesce(author, '')) LIKE '%prefeitura%'
            OR lower(coalesce(title, '')) LIKE '%prefeito%'
            OR lower(coalesce(summary, '')) LIKE '%prefeito%'
            OR lower(coalesce(content, '')) LIKE '%prefeito%'
            OR lower(coalesce(content, '')) LIKE '%executivo municipal%'
            OR lower(coalesce(content, '')) LIKE '%gabinete do prefeito%'
            OR lower(coalesce(summary, '')) LIKE '%lei orçamentária anual%'
            OR lower(coalesce(summary, '')) LIKE '%diretrizes orçamentárias%'
            OR lower(coalesce(summary, '')) LIKE '%plano plurianual%'
            OR lower(coalesce(summary, '')) LIKE '%crédito adicional%'
          THEN 'executivo'
          WHEN coalesce(nullif(trim(author), ''), '') <> ''
          THEN 'legislativo'
          ELSE 'nao_informado'
        END
        WHERE origin IS NULL OR origin = '' OR origin = 'nao_informado'
      `)

      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        DROP CONSTRAINT IF EXISTS ${this.tableName}_origin_check
      `)
      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        ADD CONSTRAINT ${this.tableName}_origin_check
        CHECK (origin IN ('legislativo', 'executivo', 'nao_informado'))
      `)
      await db.rawQuery(`
        CREATE INDEX IF NOT EXISTS ${this.tableName}_origin_idx
        ON ${this.tableName} (origin)
      `)
    })
  }

  async down() {
    const hasColumn = await this.schema.hasColumn(this.tableName, 'origin')
    if (hasColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('origin')
      })
    }
  }
}
