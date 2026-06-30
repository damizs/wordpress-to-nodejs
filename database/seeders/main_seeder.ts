import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { randomUUID } from 'node:crypto'
import env from '#start/env'
import User from '#models/user'
import Legislature from '#models/legislature'
import NewsCategory from '#models/news_category'
import QuickLink from '#models/quick_link'
import { camara } from '#config/camara'

/**
 * É esta câmara a de Sumé (ou um ambiente ainda não parametrizado)?
 *
 * Base reutilizável multi-câmara: este seeder roda no `db:seed` de TODA câmara,
 * então o que é ESPECÍFICO de Sumé (e-mail do admin de Sumé, "12ª Legislatura")
 * fica condicionado a este guard. Default = Sumé → comportamento atual intocado.
 * Câmara nova (CAMARA_CIDADE != "Sumé") usa o caminho limpo (`node ace camara:init`),
 * que cria o admin de ADMIN_INITIAL_EMAIL e uma legislatura genérica.
 *
 * Override explícito: SEED_SUME_CONTENT=true|false força o comportamento.
 */
function shouldSeedSumeContent(): boolean {
  const flag = (process.env.SEED_SUME_CONTENT || '').trim().toLowerCase()
  if (flag === 'true') return true
  if (flag === 'false') return false
  return camara.cidade.trim().toLowerCase() === 'sumé'
}

/**
 * Seeder seguro para produção: roda a cada boot (startup.sh), portanto só
 * garante dados essenciais que não existem — NUNCA conteúdo de demonstração
 * e NUNCA sobrescreve dados reais (senha do admin, legislatura, etc).
 */
export default class MainSeeder extends BaseSeeder {
  async run() {
    const isSume = shouldSeedSumeContent()

    // Usuário admin inicial de Sumé — firstOrCreate para NÃO resetar a senha a cada
    // boot. A senha vem de ADMIN_INITIAL_PASSWORD (Coolify); sem env, gera aleatória
    // (nunca uma senha conhecida/versionada). Só afeta ambientes NOVOS de SUMÉ — onde
    // o admin já existe, o firstOrCreate não recria.
    // Em câmara NOVA o admin é criado por `camara:init` (de ADMIN_INITIAL_EMAIL),
    // por isso NÃO injetamos o e-mail de Sumé aqui.
    if (isSume) {
      const initialPassword = env.get('ADMIN_INITIAL_PASSWORD') || `chg-${randomUUID()}`
      await User.firstOrCreate(
        { email: 'admin@camaradesume.pb.gov.br' },
        {
          fullName: 'Administrador',
          email: 'admin@camaradesume.pb.gov.br',
          password: initialPassword,
          role: 'super_admin',
          isActive: true,
        }
      )

      // Legislatura atual de Sumé — só cria se não existir nenhuma.
      // (Câmara nova recebe uma legislatura genérica via `camara:init`.)
      const hasLegislature = await Legislature.query().first()
      if (!hasLegislature) {
        await Legislature.create({
          name: '12ª Legislatura',
          number: 12,
          startDate: '2025-01-01',
          endDate: '2028-12-31',
          isCurrent: true,
        })
      }
    }

    // Categorias de notícias padrão (reais, idempotente e não destrutivo)
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

    // Links rápidos padrão — só cria na primeira vez (admin pode editar/remover)
    const hasQuickLinks = await QuickLink.query().first()
    if (!hasQuickLinks) {
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

    console.log('Seed completed (production-safe)')
  }
}
