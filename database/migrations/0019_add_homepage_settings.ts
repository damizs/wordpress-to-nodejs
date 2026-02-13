import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'site_settings'

  async up() {
    // Ensure label column exists (may be missing from earlier deploy)
    const hasLabel = await this.db.rawQuery(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'label'`
    )
    if (hasLabel.rows.length === 0) {
      await this.db.rawQuery(`ALTER TABLE site_settings ADD COLUMN label VARCHAR(200)`)
    }

    // Homepage section settings - to control texts and visibility of each section
    const settings = [
      // Hero section
      { group: 'homepage_hero', key: 'homepage_hero_title', value: 'Câmara Municipal de Sumé', type: 'text', label: 'Título do Hero' },
      { group: 'homepage_hero', key: 'homepage_hero_subtitle', value: 'Legislatura 2025-2028 | Transparência e compromisso com o povo sumeense', type: 'text', label: 'Subtítulo do Hero' },

      // Quick Access section
      { group: 'homepage_quickaccess', key: 'homepage_quickaccess_title', value: 'Acesso Rápido', type: 'text', label: 'Título Acesso Rápido' },
      { group: 'homepage_quickaccess', key: 'homepage_quickaccess_subtitle', value: 'Acompanhe as funções legislativa, fiscalizadora e deliberativa da Casa do Povo.', type: 'text', label: 'Subtítulo Acesso Rápido' },
      { group: 'homepage_quickaccess', key: 'homepage_quickaccess_badge', value: 'Navegação Rápida', type: 'text', label: 'Badge Acesso Rápido' },

      // E-SIC section
      { group: 'homepage_esic', key: 'homepage_esic_title', value: 'E-SIC - Sistema Eletrônico de Informações', type: 'text', label: 'Título E-SIC' },
      { group: 'homepage_esic', key: 'homepage_esic_subtitle', value: 'Acesse informações públicas e solicite dados da administração municipal de forma transparente', type: 'text', label: 'Subtítulo E-SIC' },
      { group: 'homepage_esic', key: 'homepage_esic_address', value: 'Rua Luiz Grande, s/n - Centro\nCEP: 58540-000\nSumé - PB', type: 'text', label: 'Endereço E-SIC' },
      { group: 'homepage_esic', key: 'homepage_esic_hours', value: 'Segunda à Sexta-feira\ndas 8h às 14h', type: 'text', label: 'Horário E-SIC' },
      { group: 'homepage_esic', key: 'homepage_esic_phone', value: '(83) 3353-1191', type: 'text', label: 'Telefone E-SIC' },
      { group: 'homepage_esic', key: 'homepage_esic_email', value: 'contato@camaradesume.pb.gov.br', type: 'text', label: 'Email E-SIC' },

      // Vereadores section
      { group: 'homepage_vereadores', key: 'homepage_vereadores_title', value: 'Mesa Diretora e Vereadores', type: 'text', label: 'Título Vereadores' },
      { group: 'homepage_vereadores', key: 'homepage_vereadores_subtitle', value: 'Composição da Mesa Diretora e parlamentares da Legislatura 2025-2028', type: 'text', label: 'Subtítulo Vereadores' },
      { group: 'homepage_vereadores', key: 'homepage_vereadores_badge', value: 'Legislatura 2025-2028', type: 'text', label: 'Badge Legislatura' },

      // Transparency section
      { group: 'homepage_transparency', key: 'homepage_transparency_title', value: 'Portal da Transparência', type: 'text', label: 'Título Transparência' },
      { group: 'homepage_transparency', key: 'homepage_transparency_subtitle', value: 'Acesse informações sobre a gestão pública municipal', type: 'text', label: 'Subtítulo Transparência' },

      // Diário Oficial section
      { group: 'homepage_diario', key: 'homepage_diario_title', value: 'Diário Oficial', type: 'text', label: 'Título Diário Oficial' },
      { group: 'homepage_diario', key: 'homepage_diario_subtitle', value: 'Fique sempre atualizado com as publicações e informações oficiais do município', type: 'text', label: 'Subtítulo Diário' },

      // Conheça Sumé section
      { group: 'homepage_conheca', key: 'homepage_conheca_title', value: 'Conheça Sumé', type: 'text', label: 'Título Conheça Sumé' },
      { group: 'homepage_conheca', key: 'homepage_conheca_subtitle', value: 'Descubra as belezas e a cultura da nossa cidade', type: 'text', label: 'Subtítulo Conheça' },

      // Seals section
      { group: 'homepage_seals', key: 'homepage_seals_title', value: 'Compromisso com a Transparência', type: 'text', label: 'Título Selos' },
      { group: 'homepage_seals', key: 'homepage_seals_subtitle', value: 'A Câmara Municipal de Sumé é reconhecida por seu compromisso com a transparência pública e combate à corrupção.', type: 'text', label: 'Subtítulo Selos' },

      // Section visibility toggles
      { group: 'homepage_sections', key: 'section_news_visible', value: 'true', type: 'boolean', label: 'Mostrar Notícias' },
      { group: 'homepage_sections', key: 'section_quickaccess_visible', value: 'true', type: 'boolean', label: 'Mostrar Acesso Rápido' },
      { group: 'homepage_sections', key: 'section_esic_visible', value: 'true', type: 'boolean', label: 'Mostrar E-SIC' },
      { group: 'homepage_sections', key: 'section_transparency_visible', value: 'true', type: 'boolean', label: 'Mostrar Transparência' },
      { group: 'homepage_sections', key: 'section_vereadores_visible', value: 'true', type: 'boolean', label: 'Mostrar Vereadores' },
      { group: 'homepage_sections', key: 'section_diario_visible', value: 'true', type: 'boolean', label: 'Mostrar Diário Oficial' },
      { group: 'homepage_sections', key: 'section_instagram_visible', value: 'true', type: 'boolean', label: 'Mostrar Instagram' },
      { group: 'homepage_sections', key: 'section_conheca_visible', value: 'true', type: 'boolean', label: 'Mostrar Conheça Sumé' },
      { group: 'homepage_sections', key: 'section_seals_visible', value: 'true', type: 'boolean', label: 'Mostrar Selos' },
      { group: 'homepage_sections', key: 'section_survey_visible', value: 'true', type: 'boolean', label: 'Mostrar Pesquisa' },
    ]

    for (const s of settings) {
      // Only insert if key doesn't exist
      const exists = await this.db.from('site_settings').where('key', s.key).first()
      if (!exists) {
        await this.db.table('site_settings').insert({
          ...s,
          created_at: new Date(),
          updated_at: new Date(),
        })
      }
    }
  }

  async down() {
    await this.db.from('site_settings').where('group', 'like', 'homepage_%').delete()
    await this.db.from('site_settings').where('key', 'like', 'section_%').delete()
  }
}
