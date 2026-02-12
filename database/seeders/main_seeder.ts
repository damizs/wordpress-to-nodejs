import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import User from '#models/user'
import Legislature from '#models/legislature'
import Councilor from '#models/councilor'
import NewsCategory from '#models/news_category'
import News from '#models/news'
import QuickLink from '#models/quick_link'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'
import OfficialGazetteEntry from '#models/official_gazette_entry'

export default class MainSeeder extends BaseSeeder {
  async run() {
    // Admin user
    await User.updateOrCreate({ email: 'admin@camaradesume.pb.gov.br' }, {
      fullName: 'Administrador',
      email: 'admin@camaradesume.pb.gov.br',
      password: 'Camara@2025!',
      role: 'super_admin',
      isActive: true,
    })

    // Legislature
    const leg = await Legislature.updateOrCreate({ number: 12 }, {
      name: '12ª Legislatura',
      number: 12,
      startDate: '2025-01-01',
      endDate: '2028-12-31',
      isCurrent: true,
    })

    // Councilors
    const vereadores = [
      { name: 'Adriano Chaves', party: 'PP', role: 'Presidente', slug: 'adriano-chaves' },
      { name: 'Antônio Inácio', party: 'MDB', role: 'Vice-Presidente', slug: 'antonio-inacio' },
      { name: 'Carlos Eduardo', party: 'PSD', role: '1º Secretário', slug: 'carlos-eduardo' },
      { name: 'Daniel Alves', party: 'PT', role: '2º Secretário', slug: 'daniel-alves' },
      { name: 'Edvaldo Rosas', party: 'PP', role: 'Vereador', slug: 'edvaldo-rosas' },
      { name: 'Fabiano Lima', party: 'MDB', role: 'Vereador', slug: 'fabiano-lima' },
      { name: 'Genival Santos', party: 'PSD', role: 'Vereador', slug: 'genival-santos' },
      { name: 'Hélio Carneiro', party: 'REPUBLICANOS', role: 'Vereador', slug: 'helio-carneiro' },
      { name: 'Ivonete Sousa', party: 'PT', role: 'Vereadora', slug: 'ivonete-sousa' },
      { name: 'José Carlos', party: 'PP', role: 'Vereador', slug: 'jose-carlos' },
      { name: 'Maria do Socorro', party: 'MDB', role: 'Vereadora', slug: 'maria-do-socorro' },
    ]
    for (let i = 0; i < vereadores.length; i++) {
      await Councilor.updateOrCreate({ slug: vereadores[i].slug }, {
        ...vereadores[i], isActive: true, legislatureId: leg.id, displayOrder: i + 1,
      })
    }

    // News categories
    const cats = ['Legislativo', 'Institucional', 'Comissões', 'Transparência', 'Eventos']
    const slugs = ['legislativo', 'institucional', 'comissoes', 'transparencia', 'eventos']
    const catModels: Record<string, any> = {}
    for (let i = 0; i < cats.length; i++) {
      catModels[cats[i]] = await NewsCategory.updateOrCreate({ slug: slugs[i] }, { name: cats[i], slug: slugs[i] })
    }

    // News
    const newsData = [
      { title: 'Câmara de Sumé aprova projeto de modernização da administração pública', excerpt: 'Projeto visa implementar sistema digital para gestão de processos legislativos.', category: 'Legislativo' },
      { title: 'Sessão solene marca abertura dos trabalhos legislativos de 2025', excerpt: 'Vereadores definem prioridades para o ano legislativo.', category: 'Institucional' },
      { title: 'Comissão de Finanças analisa proposta do orçamento municipal', excerpt: 'Audiência pública discute destinação de recursos para saúde e educação.', category: 'Comissões' },
      { title: 'Portal da Transparência recebe atualização com novos indicadores', excerpt: 'Dados de receitas e despesas agora disponíveis em tempo real.', category: 'Transparência' },
      { title: 'Câmara promove evento sobre inclusão digital para idosos', excerpt: 'Projeto capacita moradores da terceira idade no uso de tecnologia.', category: 'Eventos' },
    ]
    const admin = await User.findBy('email', 'admin@camaradesume.pb.gov.br')
    for (let i = 0; i < newsData.length; i++) {
      const slug = `noticia-${i + 1}-${Date.now()}`
      await News.updateOrCreate({ title: newsData[i].title }, {
        title: newsData[i].title, slug, excerpt: newsData[i].excerpt,
        content: `<p>${newsData[i].excerpt}</p>`, status: 'published',
        publishedAt: DateTime.fromJSDate(new Date(2025, 1, 10 - i)),
        categoryId: catModels[newsData[i].category]?.id, authorId: admin?.id,
        viewsCount: 0,
      })
    }

    // Quick Links
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
      await QuickLink.updateOrCreate({ title: l.title }, { ...l, isActive: true })
    }

    // Transparency sections + links
    const transSections = [
      { title: 'Receitas e Despesas', slug: 'receitas-despesas', order: 1, links: ['Receitas', 'Despesas', 'Empenhos'] },
      { title: 'Licitações e Contratos', slug: 'licitacoes-contratos', order: 2, links: ['Licitações', 'Contratos', 'Atas'] },
      { title: 'Pessoal', slug: 'pessoal', order: 3, links: ['Servidores', 'Folha de Pagamento', 'Diárias'] },
      { title: 'Legislação', slug: 'legislacao', order: 4, links: ['Leis Ordinárias', 'Decretos', 'Resoluções'] },
      { title: 'Planejamento', slug: 'planejamento', order: 5, links: ['PPA', 'LDO', 'LOA'] },
      { title: 'Prestação de Contas', slug: 'prestacao-contas', order: 6, links: ['Relatórios', 'Pareceres TCE'] },
    ]
    for (const sec of transSections) {
      const section = await TransparencySection.updateOrCreate({ slug: sec.slug }, {
        title: sec.title, slug: sec.slug, displayOrder: sec.order, isActive: true,
      })
      for (let i = 0; i < sec.links.length; i++) {
        await TransparencyLink.updateOrCreate(
          { sectionId: section.id, title: sec.links[i] },
          { sectionId: section.id, title: sec.links[i], url: '#', displayOrder: i + 1, isExternal: true }
        )
      }
    }

    // Gazette
    for (let i = 0; i < 5; i++) {
      const d = new Date(2025, 1, 10 - i * 7)
      await OfficialGazetteEntry.updateOrCreate(
        { editionNumber: `${100 + i}` },
        { editionNumber: `${100 + i}`, publicationDate: d.toISOString().split('T')[0], description: `Diário Oficial - Edição ${100 + i}` }
      )
    }

    console.log('Seed completed')
  }
}
