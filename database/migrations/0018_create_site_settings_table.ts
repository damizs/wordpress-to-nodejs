import { BaseSchema } from '@adonisjs/lucid/schema'
import { camara } from '#config/camara'

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const isSume = normalize(camara.cidade) === 'sume'

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
        {
          group: 'appearance',
          key: 'color_navy',
          value: '#0a3d62',
          type: 'color',
          label: 'Cor Principal (Navy)',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'appearance',
          key: 'color_gold',
          value: '#d4a017',
          type: 'color',
          label: 'Cor Destaque (Gold)',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'appearance',
          key: 'color_sky',
          value: '#2e86de',
          type: 'color',
          label: 'Cor Secundária (Sky)',
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Appearance - Branding
        {
          group: 'appearance',
          key: 'logo_url',
          value: null,
          type: 'image',
          label: 'Logo (PNG)',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'appearance',
          key: 'favicon_url',
          value: null,
          type: 'image',
          label: 'Favicon',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'appearance',
          key: 'header_title',
          value: camara.nome.toUpperCase(),
          type: 'text',
          label: 'Título do Header',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'appearance',
          key: 'header_subtitle',
          value: 'Estado da Paraíba',
          type: 'text',
          label: 'Subtítulo do Header',
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Footer
        {
          group: 'footer',
          key: 'footer_address',
          value: camara.address || null,
          type: 'text',
          label: 'Endereço',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'footer',
          key: 'footer_phone',
          value: camara.phone || null,
          type: 'text',
          label: 'Telefone',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'footer',
          key: 'footer_email',
          value: camara.email || null,
          type: 'text',
          label: 'Email',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'footer',
          key: 'footer_hours',
          value: camara.hours,
          type: 'text',
          label: 'Horário de Funcionamento',
          created_at: new Date(),
          updated_at: new Date(),
        },

        // Social Media
        {
          group: 'social',
          key: 'social_facebook',
          value: isSume ? 'https://facebook.com/camaradesume' : null,
          type: 'text',
          label: 'Facebook',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'social',
          key: 'social_instagram',
          value: isSume ? 'https://instagram.com/camaradesume' : null,
          type: 'text',
          label: 'Instagram',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'social',
          key: 'social_youtube',
          value: isSume ? 'https://youtube.com/@camaradesume' : null,
          type: 'text',
          label: 'YouTube',
          created_at: new Date(),
          updated_at: new Date(),
        },

        // E-SIC
        {
          group: 'esic',
          key: 'esic_new_url',
          value: '#',
          type: 'text',
          label: 'Link Nova Demanda',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'esic',
          key: 'esic_consult_url',
          value: '#',
          type: 'text',
          label: 'Link Consultar Demanda',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'esic',
          key: 'esic_phone',
          value: camara.phone || null,
          type: 'text',
          label: 'Telefone E-SIC',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          group: 'esic',
          key: 'esic_email',
          value: camara.email || null,
          type: 'text',
          label: 'Email E-SIC',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
    })
  }
  async down() {
    this.schema.dropTable(this.tableName)
  }
}
