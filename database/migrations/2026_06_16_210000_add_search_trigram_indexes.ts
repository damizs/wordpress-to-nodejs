import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS pg_trgm')

    const indexes = [
      ['news', 'title'],
      ['news', 'excerpt'],
      ['news', 'content'],
      ['atas', 'title'],
      ['atas', 'content'],
      ['pautas', 'title'],
      ['pautas', 'content'],
      ['licitacoes', 'title'],
      ['licitacoes', 'object'],
      ['licitacoes', 'number'],
      ['official_publications', 'title'],
      ['official_publications', 'description'],
      ['official_publications', 'number'],
      ['legislative_activities', 'title'],
      ['legislative_activities', 'summary'],
      ['legislative_activities', 'number'],
      ['councilors', 'name'],
      ['councilors', 'parliamentary_name'],
      ['councilors', 'bio'],
      ['pages', 'title'],
      ['pages', 'content'],
      ['faq_items', 'question'],
      ['faq_items', 'answer'],
    ] as const

    for (const [table, column] of indexes) {
      await this.db.rawQuery(
        `CREATE INDEX IF NOT EXISTS ${this.indexName(table, column)}
         ON ${this.ident(table)}
         USING gin (${this.ident(column)} gin_trgm_ops)`
      )
    }
  }

  async down() {
    const indexes = [
      ['news', 'title'],
      ['news', 'excerpt'],
      ['news', 'content'],
      ['atas', 'title'],
      ['atas', 'content'],
      ['pautas', 'title'],
      ['pautas', 'content'],
      ['licitacoes', 'title'],
      ['licitacoes', 'object'],
      ['licitacoes', 'number'],
      ['official_publications', 'title'],
      ['official_publications', 'description'],
      ['official_publications', 'number'],
      ['legislative_activities', 'title'],
      ['legislative_activities', 'summary'],
      ['legislative_activities', 'number'],
      ['councilors', 'name'],
      ['councilors', 'parliamentary_name'],
      ['councilors', 'bio'],
      ['pages', 'title'],
      ['pages', 'content'],
      ['faq_items', 'question'],
      ['faq_items', 'answer'],
    ] as const

    for (const [table, column] of indexes) {
      await this.db.rawQuery(`DROP INDEX IF EXISTS ${this.indexName(table, column)}`)
    }
  }

  private ident(value: string) {
    return `"${value.replace(/"/g, '""')}"`
  }

  private indexName(table: string, column: string) {
    return this.ident(`idx_${table}_${column}_trgm`)
  }
}

