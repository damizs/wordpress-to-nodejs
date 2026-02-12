import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'councilors'
  async up() {
    this.schema.alterTable(this.tableName, (t) => {
      t.string('full_name').nullable().after('name')
      t.string('parliamentary_name').nullable().after('full_name')
      t.string('gender').nullable().after('parliamentary_name')
      t.string('marital_status').nullable().after('gender')
      t.string('education_level').nullable().after('marital_status')
      t.text('history').nullable().after('bio')
    })
  }
  async down() {
    this.schema.alterTable(this.tableName, (t) => {
      t.dropColumn('full_name')
      t.dropColumn('parliamentary_name')
      t.dropColumn('gender')
      t.dropColumn('marital_status')
      t.dropColumn('education_level')
      t.dropColumn('history')
    })
  }
}
