import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'satisfaction_surveys'

  async up() {
    this.schema.alterTable(this.tableName, (t) => {
      t.string('cpf', 14).nullable().after('phone')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (t) => {
      t.dropColumn('cpf')
    })
  }
}
