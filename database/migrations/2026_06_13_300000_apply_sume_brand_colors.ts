import { BaseSchema } from '@adonisjs/lucid/schema'
import { camara } from '#config/camara'

function isSumeTenant(): boolean {
  return camara.cidade
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim() === 'sume'
}

/**
 * Cores institucionais de Sumé: #141b47 (principal) e #272971 (secundária).
 * Aplica nas settings APENAS quando o valor ainda é o default genérico antigo
 * (#0a3d62 / #2e86de) ou está ausente — preservando qualquer cor escolhida
 * deliberadamente no painel (Aparência).
 */
export default class extends BaseSchema {
  private updates: Array<{ key: string; value: string; oldDefault: string }> = [
    { key: 'color_navy', value: '#141b47', oldDefault: '#0a3d62' },
    { key: 'color_sky', value: '#272971', oldDefault: '#2e86de' },
  ]

  async up() {
    if (!isSumeTenant()) return

    this.defer(async (db) => {
      for (const u of this.updates) {
        const row = await db.from('site_settings').where('key', u.key).first()
        if (!row) {
          await db.table('site_settings').insert({
            group: 'appearance',
            key: u.key,
            value: u.value,
            type: 'color',
            label: u.key === 'color_navy' ? 'Cor Principal (Navy)' : 'Cor Secundária (Sky)',
            created_at: new Date(),
            updated_at: new Date(),
          })
        } else if (!row.value || row.value === u.oldDefault) {
          await db.from('site_settings').where('key', u.key).update({
            value: u.value,
            updated_at: new Date(),
          })
        }
      }
    })
  }

  async down() {
    // Não reverte: cores são gerenciadas pelo painel.
  }
}
