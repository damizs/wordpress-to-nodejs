import { BaseSchema } from '@adonisjs/lucid/schema'

const SETTINGS = [
  {
    key: 'election_mode_enabled',
    value: 'false',
    type: 'boolean',
    label: 'Modo eleitoral ativo',
  },
  {
    key: 'election_start',
    value: '',
    type: 'text',
    label: 'Início do período eleitoral',
  },
  {
    key: 'election_end',
    value: '',
    type: 'text',
    label: 'Fim do período eleitoral',
  },
  {
    key: 'election_message',
    value:
      'Em atendimento à legislação eleitoral, este conteúdo institucional está temporariamente indisponível durante o período eleitoral. Permanecem acessíveis os serviços essenciais, atos oficiais, transparência pública, licitações, contratos, dados abertos e canais de atendimento ao cidadão.',
    type: 'text',
    label: 'Mensagem do modo eleitoral',
  },
]

export default class extends BaseSchema {
  async up() {
    if (!(await this.schema.hasTable('site_settings'))) return

    for (const setting of SETTINGS) {
      const exists = await this.db.from('site_settings').where('key', setting.key).first()
      if (exists) {
        await this.db.from('site_settings').where('key', setting.key).update({
          group: 'election',
          type: setting.type,
          label: setting.label,
          updated_at: new Date(),
        })
        continue
      }

      await this.db.table('site_settings').insert({
        group: 'election',
        key: setting.key,
        value: setting.value,
        type: setting.type,
        label: setting.label,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }
  }

  async down() {
    if (!(await this.schema.hasTable('site_settings'))) return
    await this.db.from('site_settings').whereIn(
      'key',
      SETTINGS.map((setting) => setting.key)
    ).delete()
  }
}
