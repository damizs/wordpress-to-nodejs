import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'getpublic_materias'

  async up() {
    const exists = await this.schema.hasTable(this.tableName)
    if (exists) return
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // Código de 14 dígitos da matéria no GetPublic — estável e único (upsert).
      table.string('codigo', 20).notNullable().unique()
      table.string('titulo', 600).notNullable()
      table.string('tipo', 120).notNullable().defaultTo('')
      // Edição do diário que contém a matéria + data de publicação.
      table.string('diario_codigo', 20).nullable()
      table.date('diario_data').nullable()
      // Link do visualizador público (o PDF vive no GetPublic — não armazenamos).
      table.string('url_materia', 500).notNullable()
      table.timestamp('synced_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['tipo'], 'idx_gp_materias_tipo')
      table.index(['diario_data'], 'idx_gp_materias_data')
    })
  }

  async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
