import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Converte status de enum nativo para varchar + CHECK explícito.
 * Normaliza valores legados (ex.: apresentada, em_tramitacao) para o conjunto canônico.
 */
export default class extends BaseSchema {
  protected tableName = 'legislative_activities'

  async up() {
    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        ALTER COLUMN status DROP DEFAULT
      `)

      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        ALTER COLUMN status TYPE varchar(50)
        USING status::text
      `)

      await db.rawQuery(`
        UPDATE ${this.tableName}
        SET status = CASE
          WHEN status ILIKE '%aprov%' OR status ILIKE '%sancion%' THEN 'aprovado'
          WHEN status ILIKE '%rejeit%' OR status ILIKE '%reprov%' THEN 'rejeitado'
          WHEN status ILIKE '%arquiv%' OR status ILIKE '%vet%' THEN 'arquivado'
          WHEN status IN ('tramitando', 'aprovado', 'rejeitado', 'arquivado') THEN status
          ELSE 'tramitando'
        END
      `)

      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        DROP CONSTRAINT IF EXISTS ${this.tableName}_status_check
      `)

      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        ADD CONSTRAINT ${this.tableName}_status_check
        CHECK (status IN ('tramitando', 'aprovado', 'rejeitado', 'arquivado'))
      `)

      await db.rawQuery(`
        ALTER TABLE ${this.tableName}
        ALTER COLUMN status SET DEFAULT 'tramitando'
      `)

      // Tipo enum órfão (Knex/Adonis costuma nomear assim)
      await db.rawQuery(`DROP TYPE IF EXISTS legislative_activities_status`)
      await db.rawQuery(`DROP TYPE IF EXISTS ${this.tableName}_status_enum`)
    })
  }

  async down() {
    // Irreversível com segurança — enum antigo não recriado
  }
}
