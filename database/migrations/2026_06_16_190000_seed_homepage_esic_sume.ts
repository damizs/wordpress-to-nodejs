import { BaseSchema } from '@adonisjs/lucid/schema'
import { camara } from '#config/camara'

/** Garante textos da seção E-SIC da home (Painel → Homepage). */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const rows = [
        {
          group: 'homepage_esic',
          key: 'homepage_esic_title',
          value: 'E-SIC - Sistema Eletrônico de Informações',
          type: 'text',
          label: 'Título E-SIC',
        },
        {
          group: 'homepage_esic',
          key: 'homepage_esic_subtitle',
          value:
            'Acesse informações públicas e solicite dados da administração municipal de forma transparente',
          type: 'text',
          label: 'Subtítulo E-SIC',
        },
        {
          group: 'homepage_esic',
          key: 'homepage_esic_address',
          value: camara.address,
          type: 'text',
          label: 'Endereço E-SIC',
        },
        {
          group: 'homepage_esic',
          key: 'homepage_esic_hours',
          value: camara.hours,
          type: 'text',
          label: 'Horário E-SIC',
        },
        {
          group: 'homepage_esic',
          key: 'homepage_esic_phone',
          value: camara.phone,
          type: 'text',
          label: 'Telefone E-SIC',
        },
        {
          group: 'homepage_esic',
          key: 'homepage_esic_email',
          value: camara.email,
          type: 'text',
          label: 'Email E-SIC',
        },
      ]

      for (const row of rows) {
        const existing = await db.from('site_settings').where('key', row.key).first()
        if (!existing) {
          await db.table('site_settings').insert({
            ...row,
            created_at: new Date(),
            updated_at: new Date(),
          })
          continue
        }
        const val = String(existing.value || '')
        const stale =
          !val.trim() ||
          val.toLowerCase().includes('antônio vieira') ||
          val.toLowerCase().includes('antonio vieira') ||
          val.includes('3353-1175') ||
          val.toLowerCase().includes('cuité')
        if (
          stale &&
          (row.key.includes('address') || row.key.includes('phone') || row.key.includes('hours'))
        ) {
          await db.from('site_settings').where('key', row.key).update({
            value: row.value,
            updated_at: new Date(),
          })
        }
      }
    })
  }

  async down() {}
}
