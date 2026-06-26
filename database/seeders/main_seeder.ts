import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { randomUUID } from 'node:crypto'
import env from '#start/env'
import User from '#models/user'
import Legislature from '#models/legislature'
import NewsCategory from '#models/news_category'
import QuickLink from '#models/quick_link'

/**
 * Seeder seguro para produção: roda a cada boot (startup.sh), portanto só
 * garante dados essenciais que não existem — NUNCA conteúdo de demonstração
 * e NUNCA sobrescreve dados reais (senha do admin, legislatura, etc).
 */
export default class MainSeeder extends BaseSeeder {
  async run() {
    // Usuário admin inicial — firstOrCreate para NÃO resetar a senha a cada boot.
    // A senha vem de ADMIN_INITIAL_PASSWORD (Coolify); sem env, gera uma aleatória
    // (nunca uma senha conhecida/versionada). Só afeta ambientes NOVOS — onde o
    // admin já existe, o firstOrCreate não recria.
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

    // Legislatura atual — só cria se não existir nenhuma
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
