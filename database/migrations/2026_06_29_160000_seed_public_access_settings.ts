import { BaseSchema } from '@adonisjs/lucid/schema'
import { DEFAULT_PUBLIC_UNAVAILABLE_MESSAGE } from '#helpers/public_access'

const SETTINGS = [
  {
    key: 'public_access_disabled_areas',
    value: '[]',
    type: 'json',
    label: 'Áreas públicas temporariamente desativadas',
  },
  {
    key: 'public_access_blocked_paths',
    value: '',
    type: 'text',
    label: 'Rotas públicas temporariamente desativadas',
  },
  {
    key: 'public_unavailable_message',
    value: DEFAULT_PUBLIC_UNAVAILABLE_MESSAGE,
    type: 'text',
    label: 'Mensagem de indisponibilidade pública',
  },
]

export default class extends BaseSchema {
  async up() {
    if (!(await this.schema.hasTable('site_settings'))) return

    for (const setting of SETTINGS) {
      const exists = await this.db.from('site_settings').where('key', setting.key).first()
      if (exists) {
        await this.db.from('site_settings').where('key', setting.key).update({
          group: 'public_access',
          type: setting.type,
          label: setting.label,
          updated_at: new Date(),
        })
        continue
      }

      await this.db.table('site_settings').insert({
        group: 'public_access',
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
