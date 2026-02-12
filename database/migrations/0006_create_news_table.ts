import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'news'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('title').notNullable()
      t.string('slug').notNullable().unique()
      t.text('excerpt').nullable()
      t.text('content').notNullable()
      t.string('cover_image_url').nullable()
      t.enum('status', ['draft', 'published', 'archived']).defaultTo('draft')
      t.timestamp('published_at').nullable()
      t.integer('category_id').unsigned().references('id').inTable('news_categories').onDelete('SET NULL').nullable()
      t.integer('author_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable()
      t.integer('views_count').defaultTo(0)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
