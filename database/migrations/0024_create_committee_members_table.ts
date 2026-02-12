import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'committee_members'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.integer('committee_id').unsigned().references('id').inTable('committees').onDelete('CASCADE').notNullable()
      t.integer('councilor_id').unsigned().references('id').inTable('councilors').onDelete('CASCADE').notNullable()
      t.string('role').defaultTo('Membro') // Presidente, Vice-Presidente, Membro
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
