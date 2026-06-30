/*
|--------------------------------------------------------------------------
| Configuração da CÂMARA (tenant) — base reutilizável multi-câmara
|--------------------------------------------------------------------------
|
| Fonte ÚNICA da identidade + integrações específicas de cada câmara.
| HOJE: lê do `process.env` com DEFAULTS = Sumé (não quebra a produção atual).
| AMANHÃ: o Hub central pode entregar esses valores por tenant (boot/pull),
| sem refatorar quem consome — basta esta config passar a ler do hub.
|
| Regra: NADA específico de uma câmara deve ficar chumbado em controllers,
| services, helpers ou páginas. Tudo passa por aqui (ou por site_settings,
| quando for editável pelo painel).
|
*/

function val(key: string, fallback: string): string {
  const v = process.env[key]
  return v && v.trim() ? v.trim() : fallback
}

export const camara = {
  // ---- Identidade institucional ----
  nome: val('CAMARA_NOME', 'Câmara Municipal de Sumé'),
  nomeCurto: val('CAMARA_NOME_CURTO', 'Câmara de Sumé'),
  cidade: val('CAMARA_CIDADE', 'Sumé'),
  uf: val('CAMARA_UF', 'PB'),

  // ---- URLs ----
  /** URL do app Node (SEO/canonical/sitemap). */
  baseUrl: val('CAMARA_BASE_URL', 'https://node.camaradesume.pb.gov.br'),
  /** Domínio público final (proxy), quando diferente do app Node. */
  siteUrl: val('CAMARA_SITE_URL', 'https://camaradesume.pb.gov.br'),
  /** E-mail institucional padrão (fallback quando não há setting). */
  email: val('CAMARA_EMAIL', 'contato@camaradesume.pb.gov.br'),

  // ---- Integração GetPublic (Diário Oficial / Matérias) ----
  /** Código da entidade no GetPublic (Sumé = CMSU). */
  getpublicEntity: val('GETPUBLIC_ENTITY', 'CMSU'),

  // ---- Migração do WordPress de origem ----
  /** Prefixo das tabelas no dump WP (auto-detectável; default = Sumé). */
  wpTablePrefix: val('WP_TABLE_PREFIX', 'sql_camarasume'),
  /** Domínio do site WP de origem (resolver URLs relativas de uploads). */
  wpSourceDomain: val('WP_SOURCE_DOMAIN', 'camaradesume.pb.gov.br'),
}

export type CamaraConfig = typeof camara
export default camara
