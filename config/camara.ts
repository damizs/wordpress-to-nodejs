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

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function val(key: string, fallback: string): string {
  const v = process.env[key]
  return v && v.trim() ? v.trim() : fallback
}

function hostFromUrl(value: string): string {
  if (!value) return ''
  try {
    return new URL(value).hostname
  } catch {
    return value.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  }
}

const cidade = val('CAMARA_CIDADE', 'Sumé')
const uf = val('CAMARA_UF', 'PB')
const isSume = normalize(cidade) === 'sume'
const siteUrl = val('CAMARA_SITE_URL', isSume ? 'https://camaradesume.pb.gov.br' : '')
const baseUrl = val('CAMARA_BASE_URL', isSume ? 'https://node.camaradesume.pb.gov.br' : siteUrl)
const publicHost = hostFromUrl(siteUrl || baseUrl).replace(/^node\./, '')
const defaultEmail = isSume
  ? 'contato@camaradesume.pb.gov.br'
  : publicHost
    ? `contato@${publicHost}`
    : ''

export const camara = {
  // ---- Identidade institucional ----
  nome: val('CAMARA_NOME', isSume ? 'Câmara Municipal de Sumé' : `Câmara Municipal de ${cidade}`),
  nomeCurto: val('CAMARA_NOME_CURTO', isSume ? 'Câmara de Sumé' : `Câmara de ${cidade}`),
  cidade,
  uf,

  // ---- URLs ----
  /** URL do app Node (SEO/canonical/sitemap). */
  baseUrl,
  /** Domínio público final (proxy), quando diferente do app Node. */
  siteUrl,
  /** E-mail institucional padrão (fallback quando não há setting). */
  email: val('CAMARA_EMAIL', defaultEmail),
  /** Contatos editáveis no painel; em câmaras novas ficam vazios até conferência. */
  address: val(
    'CAMARA_ADDRESS',
    isSume ? 'Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB, 58540-000' : ''
  ),
  phone: val('CAMARA_PHONE', isSume ? '(83) 3353-1175' : ''),
  hours: val('CAMARA_HOURS', 'Seg a Sex, 8h às 14h'),

  // ---- Integração GetPublic (Diário Oficial / Matérias) ----
  /** Código da entidade no GetPublic (Sumé = CMSU). */
  getpublicEntity: val('GETPUBLIC_ENTITY', isSume ? 'CMSU' : ''),

  // ---- Migração do WordPress de origem ----
  /** Prefixo das tabelas no dump WP (auto-detectável; default = Sumé). */
  wpTablePrefix: val('WP_TABLE_PREFIX', isSume ? 'sql_camarasume' : ''),
  /** Domínio do site WP de origem (resolver URLs relativas de uploads). */
  wpSourceDomain: val('WP_SOURCE_DOMAIN', isSume ? 'camaradesume.pb.gov.br' : publicHost),
}

export type CamaraConfig = typeof camara
export default camara
