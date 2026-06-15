import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'duodecimos'

  async up() {
    const exists = await this.schema.hasTable(this.tableName)
    if (exists) return

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('year').notNullable()
      table.integer('month').notNullable() // 1..12
      table.decimal('previsto', 14, 2).notNullable().defaultTo(0)
      table.decimal('recebido', 14, 2).nullable()
      table.date('repasse_date').nullable()
      table.string('document_url').nullable()
      table.string('notes').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['year', 'month'])
    })
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
