import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  private statements = [
    // --- Índices de chaves estrangeiras sem índice (25 FKs detectadas no banco ao vivo) ---
    'CREATE INDEX IF NOT EXISTS idx_atricon_statuses_updated_by ON atricon_statuses (updated_by)',
    'CREATE INDEX IF NOT EXISTS idx_auth_access_tokens_tokenable_id ON auth_access_tokens (tokenable_id)',
    'CREATE INDEX IF NOT EXISTS idx_biennia_legislature_id ON biennia (legislature_id)',
    'CREATE INDEX IF NOT EXISTS idx_committee_members_committee_id ON committee_members (committee_id)',
    'CREATE INDEX IF NOT EXISTS idx_committee_members_councilor_id ON committee_members (councilor_id)',
    'CREATE INDEX IF NOT EXISTS idx_committees_legislature_id ON committees (legislature_id)',
    'CREATE INDEX IF NOT EXISTS idx_contracts_licitacao_id ON contracts (licitacao_id)',
    'CREATE INDEX IF NOT EXISTS idx_councilor_positions_biennium_id ON councilor_positions (biennium_id)',
    'CREATE INDEX IF NOT EXISTS idx_councilor_positions_councilor_id ON councilor_positions (councilor_id)',
    'CREATE INDEX IF NOT EXISTS idx_councilors_legislature_id ON councilors (legislature_id)',
    'CREATE INDEX IF NOT EXISTS idx_instagram_import_logs_imported_by ON instagram_import_logs (imported_by)',
    'CREATE INDEX IF NOT EXISTS idx_instagram_import_logs_news_id ON instagram_import_logs (news_id)',
    'CREATE INDEX IF NOT EXISTS idx_la_authors_councilor_id ON legislative_activity_authors (councilor_id)',
    'CREATE INDEX IF NOT EXISTS idx_news_author_id ON news (author_id)',
    'CREATE INDEX IF NOT EXISTS idx_news_category_id ON news (category_id)',
    'CREATE INDEX IF NOT EXISTS idx_nve_councilor_id ON nominal_voting_entries (councilor_id)',
    'CREATE INDEX IF NOT EXISTS idx_nve_nominal_voting_id ON nominal_voting_entries (nominal_voting_id)',
    'CREATE INDEX IF NOT EXISTS idx_nominal_votings_la_id ON nominal_votings (legislative_activity_id)',
    'CREATE INDEX IF NOT EXISTS idx_nominal_votings_plenary_session_id ON nominal_votings (plenary_session_id)',
    'CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions (permission_id)',
    'CREATE INDEX IF NOT EXISTS idx_survey_responses_question_id ON survey_responses (question_id)',
    'CREATE INDEX IF NOT EXISTS idx_transparency_links_section_id ON transparency_links (section_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles (role_id)',
    // --- Índices de filtro/ordenação das listagens públicas ---
    // news: home + /noticias filtram status='published' e ordenam por published_at desc
    "CREATE INDEX IF NOT EXISTS idx_news_status_published_at ON news (status, published_at DESC)",
    // official_gazette_entries: /diario-oficial ordena por publication_date desc e faz range por ano
    'CREATE INDEX IF NOT EXISTS idx_oge_publication_date ON official_gazette_entries (publication_date DESC)',
    // official_publications: ordena por publication_date desc, filtra por type
    'CREATE INDEX IF NOT EXISTS idx_official_publications_publication_date ON official_publications (publication_date DESC)',
    'CREATE INDEX IF NOT EXISTS idx_official_publications_type ON official_publications (type)',
    // councilors: filtra is_active e ordena display_order
    'CREATE INDEX IF NOT EXISTS idx_councilors_active_order ON councilors (is_active, display_order)',
    // legislative_activities: filtra is_active, year, status, origin, type e ordena por year/created_at
    'CREATE INDEX IF NOT EXISTS idx_la_active_year ON legislative_activities (is_active, year DESC)',
    'CREATE INDEX IF NOT EXISTS idx_la_status ON legislative_activities (status)',
    'CREATE INDEX IF NOT EXISTS idx_la_type ON legislative_activities (type)',
    // licitacoes: filtra is_active, status, modality, year; ordena created_at desc
    'CREATE INDEX IF NOT EXISTS idx_licitacoes_active_created_at ON licitacoes (is_active, created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_licitacoes_status ON licitacoes (status)',
    'CREATE INDEX IF NOT EXISTS idx_licitacoes_modality ON licitacoes (modality)',
    'CREATE INDEX IF NOT EXISTS idx_licitacoes_year ON licitacoes (year)',
    // contracts: filtra is_active, status, year; ordena year/number
    'CREATE INDEX IF NOT EXISTS idx_contracts_active_year ON contracts (is_active, year DESC)',
    // fiscal_reports: filtra is_active, report_type, year
    'CREATE INDEX IF NOT EXISTS idx_fiscal_reports_active_year ON fiscal_reports (is_active, year DESC)',
    // atas/pautas: filtra is_published e ordena document_date desc
    'CREATE INDEX IF NOT EXISTS idx_atas_published_doc_date ON atas (is_published, document_date DESC)',
    'CREATE INDEX IF NOT EXISTS idx_pautas_published_doc_date ON pautas (is_published, document_date DESC)',
  ]

  async up() {
    // Índices de performance: uma falha pontual (tabela/coluna ausente em algum
    // ambiente) NÃO deve derrubar o boot (startup.sh roda migration:run --force).
    for (const sql of this.statements) {
      try {
        await this.db.rawQuery(sql)
      } catch (error) {
        console.warn(`[alinhamento_indices] índice ignorado: ${error.message}`)
      }
    }
  }

  async down() {
    for (const sql of this.statements) {
      const name = sql.match(/idx_[a-z_]+/)![0]
      await this.db.rawQuery(`DROP INDEX IF EXISTS ${name}`)
    }
  }
}
