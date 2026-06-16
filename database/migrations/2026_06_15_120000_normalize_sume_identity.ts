import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Normalização de identidade institucional → Câmara Municipal de Sumé.
 *
 * A instância em produção herdou conteúdo de um projeto anterior (Câmara de
 * Cuité): título/rodapé, selos e textos institucionais. Os DEFAULTS do código
 * e das migrations já são de Sumé — esta migração apenas LIMPA os resíduos
 * "Cuité" que sobraram no banco daquela instância.
 *
 * Conservadora e idempotente:
 * - só mexe em valores que contêm os tokens de Cuité (nada legítimo de Sumé os contém);
 * - reseta apenas os campos de identidade/contato para o default de Sumé;
 * - troca os tokens textuais nos demais campos (selos, institucional, menus).
 *
 * NÃO resolve o que depende de arquivo/decisão humana (ex.: logo com o nome da
 * casa embutido, nível do selo Ouro × Diamante) — isso fica para o painel.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const hasCuite = (v: unknown) => /cuit[eé]|manoel felipe/i.test(String(v ?? ''))

      // 1) Campos de identidade/contato: voltam ao default de Sumé quando vazios
      //    ou quando ainda carregam dados de Cuité.
      const identityDefaults: Record<string, string> = {
        header_title: 'CÂMARA MUNICIPAL DE SUMÉ',
        header_subtitle: 'Estado da Paraíba',
        footer_description: 'Comprometida com a transparência e o bem-estar da população.',
        footer_address: 'Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB',
        footer_phone: '(83) 3353-1175',
        footer_email: 'contato@camaradesume.pb.gov.br',
      }

      for (const [key, value] of Object.entries(identityDefaults)) {
        const row = await db.from('site_settings').where('key', key).first()
        const current = String(row?.value ?? '').trim()
        if (row && (current === '' || hasCuite(current))) {
          await db
            .from('site_settings')
            .where('key', key)
            .update({ value, updated_at: new Date() })
        }
      }

      // 2) Substituição de tokens textuais nos demais campos (preserva o resto do texto).
      const normalize = (raw: string) =>
        raw
          .replace(/CUITÉ/g, 'SUMÉ')
          .replace(/CUITE/g, 'SUMÉ')
          .replace(/Cuité/g, 'Sumé')
          .replace(/Cuite/g, 'Sumé')
          .replace(/cuité/g, 'sumé')
          .replace(/camaradecuite/g, 'camaradesume')

      // site_settings (homepage_seals_subtitle, footer_columns, esic_email, etc.)
      const settings = await db.from('site_settings').select('id', 'value')
      for (const s of settings) {
        if (typeof s.value === 'string' && /cuit[eé]/i.test(s.value)) {
          await db
            .from('site_settings')
            .where('id', s.id)
            .update({ value: normalize(s.value), updated_at: new Date() })
        }
      }

      // seals (título/descrição) — nível do selo (Ouro/Diamante) e imagem ficam no painel
      const seals = await db.from('seals').select('id', 'title', 'description')
      for (const seal of seals) {
        const next: Record<string, unknown> = {}
        if (typeof seal.title === 'string' && /cuit[eé]/i.test(seal.title))
          next.title = normalize(seal.title)
        if (typeof seal.description === 'string' && /cuit[eé]/i.test(seal.description))
          next.description = normalize(seal.description)
        if (Object.keys(next).length > 0) {
          next.updated_at = new Date()
          await db.from('seals').where('id', seal.id).update(next)
        }
      }

      // institutional_content (título/conteúdo de Sobre/História)
      const institutional = await db.from('institutional_content').select('id', 'title', 'content')
      for (const item of institutional) {
        const next: Record<string, unknown> = {}
        if (typeof item.title === 'string' && /cuit[eé]/i.test(item.title))
          next.title = normalize(item.title)
        if (typeof item.content === 'string' && /cuit[eé]/i.test(item.content))
          next.content = normalize(item.content)
        if (Object.keys(next).length > 0) {
          next.updated_at = new Date()
          await db.from('institutional_content').where('id', item.id).update(next)
        }
      }
    })
  }

  async down() {
    // Correção de dados: sem rollback.
  }
}
