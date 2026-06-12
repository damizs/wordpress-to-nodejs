import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'media_files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('filename').notNullable()
      table.string('url').notNullable()
      table.string('mime_type').notNullable()
      table.bigInteger('size').unsigned().notNullable().defaultTo(0)
      table.integer('uploaded_by').unsigned().nullable()
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
