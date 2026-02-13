import { BaseSchema } from '@adonisjs/lucid/schema'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default class extends BaseSchema {
  async up() {
    // Read the WordPress migration SQL file
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const sqlPath = join(__dirname, '..', 'wordpress_migration.sql')
    let sql: string

    try {
      sql = readFileSync(sqlPath, 'utf-8')
    } catch {
      console.log('wordpress_migration.sql not found, skipping WordPress data import')
      return
    }

    // Extract and execute individual statements (skip comments, BEGIN/COMMIT)
    const statements = sql
      .split('\n')
      .filter((line) => {
        const trimmed = line.trim()
        return (
          trimmed.length > 0 &&
          !trimmed.startsWith('--') &&
          trimmed !== 'BEGIN;' &&
          trimmed !== 'COMMIT;'
        )
      })
      .join('\n')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    console.log(`Importing ${statements.length} WordPress records...`)

    let success = 0
    let errors = 0

    for (const stmt of statements) {
      try {
        await this.db.rawQuery(stmt)
        success++
      } catch (err: any) {
        errors++
        if (errors <= 3) {
          console.log(`  Warning: ${err.message?.substring(0, 100)}`)
        }
      }
    }

    console.log(`WordPress import: ${success} success, ${errors} errors`)
  }

  async down() {
    // Reverse: clear all imported data
    const tables = [
      'quick_links',
      'news',
      'information_records',
      'faq_items',
      'plenary_sessions',
      'official_publications',
      'legislative_activities',
      'councilors',
    ]

    for (const table of tables) {
      try {
        await this.db.rawQuery(`DELETE FROM ${table}`)
      } catch {
        // table might not exist
      }
    }
  }
}
