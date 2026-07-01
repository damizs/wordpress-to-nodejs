import { BaseSchema } from '@adonisjs/lucid/schema'
import { camara } from '#config/camara'

const rows = [
  {
    group: 'esic',
    key: 'sic_unit',
    value: `Serviço de Informação ao Cidadão (SIC) da ${camara.nome}`,
    type: 'text',
    label: 'Unidade responsável pelo SIC',
  },
  {
    group: 'esic',
    key: 'sic_monitoring_authority',
    value: `Presidência da ${camara.nome}`,
    type: 'text',
    label: 'Autoridade de monitoramento',
  },
]

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const now = new Date()

      for (const row of rows) {
        const existing = await db.from('site_settings').where('key', row.key).first()
        if (existing) continue

        await db.table('site_settings').insert({
          ...row,
          created_at: now,
          updated_at: now,
        })
      }
    })
  }

  async down() {
    // Migration de dados: preserva edições manuais.
  }
}
