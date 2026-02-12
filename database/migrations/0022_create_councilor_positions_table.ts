import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'councilor_positions'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.integer('councilor_id').unsigned().references('id').inTable('councilors').onDelete('CASCADE').notNullable()
      t.integer('biennium_id').unsigned().references('id').inTable('biennia').onDelete('CASCADE').notNullable()
      t.string('position').notNullable() // Presidente, Vice-Presidente, 1º Secretário(a), 2º Secretário(a), Vereador
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
