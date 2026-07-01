import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    if (!(await this.schema.hasTable('site_settings'))) return

    await this.db.from('site_settings').where('key', 'theme_preset').where((query) => {
      query.whereNull('value').orWhere('value', '').orWhere('value', 'navy')
    }).update({
      value: 'custom',
      updated_at: new Date(),
    })

    await this.db.from('site_settings').where('key', 'admin_palette').where((query) => {
      query.whereNull('value').orWhere('value', '').orWhere('value', 'navy')
    }).update({
      value: 'custom',
      updated_at: new Date(),
    })

    await this.db.from('site_settings').where('key', 'campaign_mode').where((query) => {
      query.whereNull('value').orWhere('value', '').orWhere('value', 'auto')
    }).update({
      value: 'off',
      updated_at: new Date(),
    })
  }

  async down() {
    // Ajuste de segurança operacional: sem rollback automático de paleta/campanha.
  }
}
