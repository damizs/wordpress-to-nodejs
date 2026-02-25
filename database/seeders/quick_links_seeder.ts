import { BaseSeeder } from '@adonisjs/lucid/seeders'
import QuickLink from '#models/quick_link'

export default class extends BaseSeeder {
  async run() {
    // Limpa links existentes
    await QuickLink.query().delete()

    // Links rápidos padrão para câmara municipal
    const links = [
      { title: 'Sessões Plenárias', url: 'https://www.youtube.com/@camaramunicipaldeSume', icon: 'Youtube', color: 'red', displayOrder: 1, isActive: true },
      { title: 'Leis Municipais', url: '/leis', icon: 'Scale', color: 'navy', displayOrder: 2, isActive: true },
      { title: 'Portal da Transparência', url: '/transparencia', icon: 'Shield', color: 'sky', displayOrder: 3, isActive: true },
      { title: 'Diário Oficial', url: '/diario-oficial', icon: 'FileText', color: 'gold', displayOrder: 4, isActive: true },
      { title: 'Vereadores', url: '/vereadores', icon: 'Users', color: 'emerald', displayOrder: 5, isActive: true },
      { title: 'Ouvidoria', url: '/ouvidoria', icon: 'MessageSquare', color: 'purple', displayOrder: 6, isActive: true },
    ]

    await QuickLink.createMany(links)
    console.log(`✓ ${links.length} links rápidos criados`)
  }
}
