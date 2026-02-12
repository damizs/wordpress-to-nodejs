import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plenary_sessions'
  async up() {
    this.schema.alterTable(this.tableName, (t) => {
      t.string('file_url').nullable().after('video_url')
      t.integer('year').nullable().after('session_date')
    })
  }
  async down() {
    this.schema.alterTable(this.tableName, (t) => {
      t.dropColumn('file_url')
      t.dropColumn('year')
    })
  }
}
