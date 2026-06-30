import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { randomUUID } from 'node:crypto'
import db from '@adonisjs/lucid/services/db'
import { camara } from '#config/camara'
import User from '#models/user'
import Legislature from '#models/legislature'
import NewsCategory from '#models/news_category'
import QuickLink from '#models/quick_link'
import SiteSetting from '#models/site_setting'
import RbacSeeder from '#database/seeders/rbac_seeder'
import SystemCategoriesSeeder from '#database/seeders/03_system_categories_seeder'

/**
 * Mapeia a UF para o subtítulo institucional padrão ("Estado da Paraíba", etc.).
 * Fallback genérico quando a UF não está no mapa. Default de Sumé = "Estado da Paraíba".
 */
const UF_SUBTITLE: Record<string, string> = {
  AC: 'Estado do Acre',
  AL: 'Estado de Alagoas',
  AP: 'Estado do Amapá',
  AM: 'Estado do Amazonas',
  BA: 'Estado da Bahia',
  CE: 'Estado do Ceará',
  DF: 'Distrito Federal',
  ES: 'Estado do Espírito Santo',
  GO: 'Estado de Goiás',
  MA: 'Estado do Maranhão',
  MT: 'Estado de Mato Grosso',
  MS: 'Estado de Mato Grosso do Sul',
  MG: 'Estado de Minas Gerais',
  PA: 'Estado do Pará',
  PB: 'Estado da Paraíba',
  PR: 'Estado do Paraná',
  PE: 'Estado de Pernambuco',
  PI: 'Estado do Piauí',
  RJ: 'Estado do Rio de Janeiro',
  RN: 'Estado do Rio Grande do Norte',
  RS: 'Estado do Rio Grande do Sul',
  RO: 'Estado de Rondônia',
  RR: 'Estado de Roraima',
  SC: 'Estado de Santa Catarina',
  SP: 'Estado de São Paulo',
  SE: 'Estado de Sergipe',
  TO: 'Estado do Tocantins',
}

/**
 * camara:init — bootstrap de uma CÂMARA NOVA (sem o acervo de Sumé).
 *
 * Idempotente e seguro de rodar várias vezes. Semeia SOMENTE a ESTRUTURA
 * (RBAC/permissões, categorias e tipos do sistema, categorias de notícias e
 * atalhos internos padrão), cria UM usuário admin a partir do ambiente
 * (ADMIN_INITIAL_EMAIL / ADMIN_INITIAL_PASSWORD) e grava as settings de
 * IDENTIDADE a partir de `config/camara` (nome, cidade, UF, e-mail).
 *
 * NÃO importa NADA de conteúdo de Sumé: não roda wp:migrate, wp:activities,
 * wp:pntp, wp:diario, portal:bootstrap, glossário, notícias, vereadores, atas
 * ou qualquer dado específico de Sumé. Para o acervo de Sumé continua valendo o
 * pipeline `scripts/wp_import.sh` (pulado em câmara nova com SKIP_CONTENT_BOOTSTRAP=true).
 *
 * Uso (dentro do container, /app):
 *   ADMIN_INITIAL_EMAIL=admin@camaranova.gov.br ADMIN_INITIAL_PASSWORD=... \
 *   CAMARA_NOME="Câmara Municipal de Fulano" CAMARA_CIDADE="Fulano" CAMARA_UF="PB" \
 *   node ace camara:init
 */
export default class CamaraInit extends BaseCommand {
  static commandName = 'camara:init'
  static description =
    'Bootstrap de câmara NOVA: estrutura (RBAC, categorias/tipos, atalhos), 1 admin de env e identidade de config/camara — sem conteúdo de Sumé'
  static options: CommandOptions = { startApp: true }

  async run() {
    this.logger.info(`━━━ camara:init — bootstrap estrutural de "${camara.nome}" ━━━`)
    const client = db.connection()

    // 1. RBAC: catálogo de permissões + papéis padrão (reusa o seeder estrutural).
    this.logger.info('1/6 RBAC (permissões + papéis padrão)…')
    await new RbacSeeder(client).run()

    // 2. Categorias e tipos do sistema (FAQ, registros PNTP, publicações, sessões).
    this.logger.info('2/6 Categorias e tipos do sistema (FAQ/PNTP/publicações/sessões)…')
    await new SystemCategoriesSeeder(client).run()

    // 3. Categorias de notícias padrão (genéricas, não destrutivas).
    this.logger.info('3/6 Categorias de notícias padrão…')
    await this.seedNewsCategories()

    // 4. Atalhos internos padrão (rotas do próprio portal — sem URLs de Sumé).
    this.logger.info('4/6 Links rápidos internos padrão…')
    await this.seedQuickLinks()

    // 5. Legislatura atual — só cria um marcador genérico se NÃO houver nenhuma.
    this.logger.info('5/6 Legislatura atual (genérica, se ausente)…')
    await this.seedCurrentLegislature()

    // 6. Usuário admin (de env) + settings de identidade (de config/camara).
    this.logger.info('6/6 Usuário admin (env) + identidade (config/camara)…')
    await this.seedAdminUser()
    await this.seedIdentitySettings()

    this.logger.success(`camara:init concluído para "${camara.nome}".`)
  }

  /** Categorias de notícias padrão — firstOrCreate por slug (não sobrescreve edições). */
  private async seedNewsCategories() {
    const cats = [
      { name: 'Legislativo', slug: 'legislativo' },
      { name: 'Institucional', slug: 'institucional' },
      { name: 'Comissões', slug: 'comissoes' },
      { name: 'Transparência', slug: 'transparencia' },
      { name: 'Eventos', slug: 'eventos' },
    ]
    for (const cat of cats) {
      await NewsCategory.firstOrCreate({ slug: cat.slug }, cat)
    }
  }

  /**
   * Atalhos rápidos padrão. Só semeia se a tabela estiver vazia (idempotente e
   * não destrutivo — admin pode editar/remover). São APENAS rotas internas do
   * portal; nenhum link externo/canal específico de Sumé.
   */
  private async seedQuickLinks() {
    const hasQuickLinks = await QuickLink.query().first()
    if (hasQuickLinks) return

    const qlinks = [
      { title: 'Leis Municipais', url: '/leis', icon: 'Scale', displayOrder: 1 },
      { title: 'Vereadores', url: '/vereadores', icon: 'Users', displayOrder: 2 },
      { title: 'Sessões Plenárias', url: '/sessoes', icon: 'Gavel', displayOrder: 3 },
      { title: 'Diário Oficial', url: '/diario-oficial', icon: 'BookOpen', displayOrder: 4 },
      { title: 'Transparência', url: '/transparencia', icon: 'Shield', displayOrder: 5 },
      { title: 'Licitações', url: '/licitacoes', icon: 'FileText', displayOrder: 6 },
      { title: 'Ouvidoria', url: '/ouvidoria', icon: 'Phone', displayOrder: 7 },
      { title: 'A Câmara', url: '/a-camara', icon: 'Building2', displayOrder: 8 },
    ]
    for (const l of qlinks) {
      await QuickLink.create({ ...l, isActive: true })
    }
  }

  /**
   * Garante UMA legislatura atual quando a câmara nova ainda não tem nenhuma.
   * Valores neutros baseados no ano corrente (mandato de 4 anos), NÃO os números
   * específicos de Sumé. Se já existir qualquer legislatura, não faz nada.
   */
  private async seedCurrentLegislature() {
    const has = await Legislature.query().first()
    if (has) return

    // Janela de mandato municipal vigente (eleições a cada 4 anos: 2021, 2025, 2029…).
    const year = new Date().getFullYear()
    const startYear = year - ((year - 2025) % 4 + 4) % 4
    await Legislature.create({
      name: `Legislatura ${startYear}–${startYear + 3}`,
      number: 1,
      startDate: `${startYear}-01-01`,
      endDate: `${startYear + 3}-12-31`,
      isCurrent: true,
    })
  }

  /**
   * Cria o admin inicial a partir do ambiente. NÃO usa o e-mail de Sumé:
   *  - ADMIN_INITIAL_EMAIL    → e-mail do admin (fallback: e-mail institucional de config/camara)
   *  - ADMIN_INITIAL_PASSWORD → senha (fallback: aleatória, nunca versionada)
   * firstOrCreate por e-mail → não reseta a senha em re-execuções.
   */
  private async seedAdminUser() {
    const email = (process.env.ADMIN_INITIAL_EMAIL || '').trim() || camara.email
    const password = process.env.ADMIN_INITIAL_PASSWORD || `chg-${randomUUID()}`

    const { user, $isLocal } = await this.firstOrCreateUser(email, password)
    if ($isLocal) {
      this.logger.info(`  admin criado: ${email}`)
      if (!process.env.ADMIN_INITIAL_PASSWORD) {
        this.logger.warning(
          '  ADMIN_INITIAL_PASSWORD não definido — senha aleatória gerada. Use "Esqueci minha senha" ou redefina no banco.'
        )
      }
    } else {
      this.logger.info(`  admin já existe: ${user.email} (senha preservada)`)
    }
  }

  private async firstOrCreateUser(email: string, password: string) {
    const existing = await User.findBy('email', email)
    if (existing) return { user: existing, $isLocal: false }
    const user = await User.create({
      fullName: 'Administrador',
      email,
      password,
      role: 'super_admin',
      isActive: true,
    })
    return { user, $isLocal: true }
  }

  /**
   * Grava as settings de IDENTIDADE a partir de `config/camara`. Só escreve as
   * chaves AINDA AUSENTES (não sobrescreve ajustes feitos no painel) — assim a
   * câmara nova não herda os defaults de Sumé do settings_controller (cabeçalho,
   * endereço, telefone, SIC etc.), mas o operador continua livre para editar.
   */
  private async seedIdentitySettings() {
    const subtitle = UF_SUBTITLE[camara.uf.toUpperCase()] || `Estado — ${camara.uf}`

    const identity: { key: string; value: string; group: string }[] = [
      { key: 'header_title', value: camara.nome.toUpperCase(), group: 'appearance' },
      { key: 'header_subtitle', value: subtitle, group: 'appearance' },
      { key: 'login_subtitle', value: camara.nome, group: 'appearance' },
      { key: 'footer_email', value: camara.email, group: 'footer' },
      // Endereço/telefone neutros (sem os de Sumé) — admin completa no painel.
      { key: 'footer_address', value: `${camara.cidade} - ${camara.uf}`, group: 'footer' },
      { key: 'footer_phone', value: '', group: 'footer' },
      {
        key: 'sic_unit',
        value: `Serviço de Informação ao Cidadão (SIC) da ${camara.nome}`,
        group: 'esic',
      },
      { key: 'sic_monitoring_authority', value: `Presidência da ${camara.nome}`, group: 'esic' },
    ]

    let written = 0
    for (const s of identity) {
      const exists = await SiteSetting.findBy('key', s.key)
      if (exists) continue
      await SiteSetting.setValue(s.key, s.value, s.group, 'text')
      written++
    }
    this.logger.info(`  identidade: ${written} setting(s) gravada(s) (já existentes preservadas)`)
  }
}
