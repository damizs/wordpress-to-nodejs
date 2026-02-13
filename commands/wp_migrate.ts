import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'

export default class WpMigrate extends BaseCommand {
  static commandName = 'wp:migrate'
  static description = 'Import WordPress data from SQL migration file'
  static options: CommandOptions = { startApp: true }

  async run() {
    this.logger.info('Starting WordPress data migration...')

    const sqlPath = join(app.appRoot.pathname, 'database', 'wordpress_migration.sql')
    let sql: string

    try {
      sql = readFileSync(sqlPath, 'utf-8')
    } catch {
      this.logger.error(`SQL file not found: ${sqlPath}`)
      return
    }

    // Split by statements (skip comments and empty lines)
    const statements = sql
      .split('\n')
      .filter((line) => !line.startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    this.logger.info(`Found ${statements.length} SQL statements`)

    let success = 0
    let errors = 0

    for (const stmt of statements) {
      try {
        await db.rawQuery(stmt)
        success++
      } catch (err: any) {
        errors++
        if (errors <= 5) {
          this.logger.warning(`Error: ${err.message}`)
          this.logger.warning(`Statement: ${stmt.substring(0, 120)}...`)
        }
      }
    }

    this.logger.info(`Migration complete: ${success} success, ${errors} errors`)

    // Show counts
    const tables = [
      'councilors',
      'legislative_activities',
      'official_publications',
      'plenary_sessions',
      'faq_items',
      'information_records',
      'news',
      'quick_links',
    ]

    for (const table of tables) {
      try {
        const result = await db.rawQuery(`SELECT COUNT(*) as total FROM ${table}`)
        const count = result.rows?.[0]?.total || result[0]?.[0]?.total || '?'
        this.logger.info(`  ${table}: ${count} records`)
      } catch {
        // table might not exist
      }
    }
  }
}
