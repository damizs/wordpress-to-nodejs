import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Correção one-off dos dados de aparência/rodapé em produção:
 * - color_navy estava com rosa de teste (#e91e63) → volta ao navy institucional
 * - color_gold/color_sky e contatos do rodapé estavam null → restaura os padrões
 * Valores personalizados legítimos (não vazios e não o rosa de teste) são preservados.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const restore = async (
        key: string,
        defaultValue: string,
        group: string,
        type: string,
        label: string,
        badValues: string[] = []
      ) => {
        const row = await db.from('site_settings').where('key', key).first()
        if (!row) {
          await db.table('site_settings').insert({
            group,
            key,
            value: defaultValue,
            type,
            label,
            created_at: new Date(),
            updated_at: new Date(),
          })
          return
        }
        const current = String(row.value ?? '').trim()
        if (!current || badValues.includes(current.toLowerCase())) {
          await db
            .from('site_settings')
            .where('key', key)
            .update({ value: defaultValue, updated_at: new Date() })
        }
      }

      await restore('color_navy', '#0a3d62', 'appearance', 'color', 'Cor Principal (Navy)', [
        '#e91e63',
      ])
      await restore('color_gold', '#d4a017', 'appearance', 'color', 'Cor Destaque (Gold)')
      await restore('color_sky', '#2e86de', 'appearance', 'color', 'Cor Secundária (Sky)')
      await restore(
        'footer_description',
        'Comprometida com a transparência e o bem-estar da população.',
        'footer',
        'text',
        'Descrição (texto abaixo da logo)'
      )
      await restore(
        'footer_address',
        'Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB',
        'footer',
        'text',
        'Endereço'
      )
      await restore('footer_phone', '(83) 3353-1175', 'footer', 'text', 'Telefone')
      await restore('footer_email', 'contato@camaradesume.pb.gov.br', 'footer', 'text', 'Email')
      await restore(
        'footer_hours',
        'Seg a Sex, 8h às 14h',
        'footer',
        'text',
        'Horário de Funcionamento'
      )
    })
  }

  async down() {
    // Correção de dados: sem rollback
  }
}
