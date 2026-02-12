import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'site_settings'
  async up() {
    this.schema.createTable(this.tableName, (t) => {
      t.increments('id')
      t.string('group', 50).notNullable().defaultTo('general') // general, appearance, footer, social, esic, instagram, diario, ai
      t.string('key', 100).notNullable().unique()
      t.text('value').nullable()
      t.string('type', 20).notNullable().defaultTo('text') // text, json, image, color, boolean, number
      t.string('label', 200).nullable()
      t.timestamp('created_at').notNullable()
      t.timestamp('updated_at').nullable()
    })

    // Seed initial settings
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        // Appearance - Colors
        { group: 'appearance', key: 'color_navy', value: '#0a3d62', type: 'color', label: 'Cor Principal (Navy)', created_at: new Date(), updated_at: new Date() },
        { group: 'appearance', key: 'color_gold', value: '#d4a017', type: 'color', label: 'Cor Destaque (Gold)', created_at: new Date(), updated_at: new Date() },
        { group: 'appearance', key: 'color_sky', value: '#2e86de', type: 'color', label: 'Cor Secundária (Sky)', created_at: new Date(), updated_at: new Date() },

        // Appearance - Branding
        { group: 'appearance', key: 'logo_url', value: null, type: 'image', label: 'Logo (PNG)', created_at: new Date(), updated_at: new Date() },
        { group: 'appearance', key: 'favicon_url', value: null, type: 'image', label: 'Favicon', created_at: new Date(), updated_at: new Date() },
        { group: 'appearance', key: 'header_title', value: 'CÂMARA MUNICIPAL DE SUMÉ', type: 'text', label: 'Título do Header', created_at: new Date(), updated_at: new Date() },
        { group: 'appearance', key: 'header_subtitle', value: 'Estado da Paraíba', type: 'text', label: 'Subtítulo do Header', created_at: new Date(), updated_at: new Date() },

        // Footer
        { group: 'footer', key: 'footer_address', value: 'Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB, 58540-000', type: 'text', label: 'Endereço', created_at: new Date(), updated_at: new Date() },
        { group: 'footer', key: 'footer_phone', value: '(83) 3353-1175', type: 'text', label: 'Telefone', created_at: new Date(), updated_at: new Date() },
        { group: 'footer', key: 'footer_email', value: 'contato@camaradesume.pb.gov.br', type: 'text', label: 'Email', created_at: new Date(), updated_at: new Date() },
        { group: 'footer', key: 'footer_hours', value: 'Seg a Sex, 8h às 14h', type: 'text', label: 'Horário de Funcionamento', created_at: new Date(), updated_at: new Date() },

        // Social Media
        { group: 'social', key: 'social_facebook', value: 'https://facebook.com/camaradesume', type: 'text', label: 'Facebook', created_at: new Date(), updated_at: new Date() },
        { group: 'social', key: 'social_instagram', value: 'https://instagram.com/camaradesume', type: 'text', label: 'Instagram', created_at: new Date(), updated_at: new Date() },
        { group: 'social', key: 'social_youtube', value: 'https://youtube.com/@camaradesume', type: 'text', label: 'YouTube', created_at: new Date(), updated_at: new Date() },

        // E-SIC
        { group: 'esic', key: 'esic_new_url', value: '#', type: 'text', label: 'Link Nova Demanda', created_at: new Date(), updated_at: new Date() },
        { group: 'esic', key: 'esic_consult_url', value: '#', type: 'text', label: 'Link Consultar Demanda', created_at: new Date(), updated_at: new Date() },
        { group: 'esic', key: 'esic_phone', value: '(83) 3353-1175', type: 'text', label: 'Telefone E-SIC', created_at: new Date(), updated_at: new Date() },
        { group: 'esic', key: 'esic_email', value: 'esic@camaradesume.pb.gov.br', type: 'text', label: 'Email E-SIC', created_at: new Date(), updated_at: new Date() },
      ])
    })
  }
  async down() { this.schema.dropTable(this.tableName) }
}
