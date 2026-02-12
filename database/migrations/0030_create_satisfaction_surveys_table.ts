import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'satisfaction_surveys'

  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('name', 255).nullable()
      t.string('email', 255).nullable()
      t.string('phone', 30).nullable()
      // Ratings 1-5
      t.integer('rating_atendimento').nullable()
      t.integer('rating_transparencia').nullable()
      t.integer('rating_legislativo').nullable()
      t.integer('rating_infraestrutura').nullable()
      t.integer('rating_geral').notNullable()
      // Open-ended
      t.text('suggestions').nullable()
      t.text('complaints').nullable()
      // Meta
      t.string('ip_address', 50).nullable()
      t.boolean('is_read').defaultTo(false)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
