import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'information_records'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('title').notNullable()
      t.string('category').notNullable() // verbas, estagiarios, terceirizados, rgf, relatorio-gestao, prestacao-contas, transferencias-recebidas, transferencias-realizadas, parecer-contas, obras, acordos, apreciacao, plano-estrategico, concursos, pca, estrutura-organizacional, carta-servicos
      t.integer('year').notNullable()
      t.text('content').nullable()
      t.date('reference_date').nullable()
      t.string('file_url').nullable()
      t.boolean('is_active').defaultTo(true)
      t.integer('display_order').defaultTo(0)
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
