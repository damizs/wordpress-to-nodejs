import { BaseSeeder } from '@adonisjs/lucid/seeders'
import QuickLink from '#models/quick_link'
import { camara } from '#config/camara'

/**
 * Câmara é Sumé (ou ambiente não parametrizado)? Default = Sumé → comportamento
 * intocado. Em câmara nova (CAMARA_CIDADE != "Sumé") o canal do YouTube de Sumé
 * é trocado por um atalho interno genérico (/sessoes), sem URL específica de Sumé.
 * Override: SEED_SUME_CONTENT=true|false.
 */
function shouldSeedSumeContent(): boolean {
  const flag = (process.env.SEED_SUME_CONTENT || '').trim().toLowerCase()
  if (flag === 'true') return true
  if (flag === 'false') return false
  return camara.cidade.trim().toLowerCase() === 'sumé'
}

export default class extends BaseSeeder {
  async run() {
    // Idempotente: só semeia se a tabela estiver vazia — roda a cada boot
    // (startup.sh) e não pode apagar links editados no painel.
    const existing = await QuickLink.query().count('* as total').first()
    if (Number(existing?.$extras.total ?? 0) > 0) {
      console.log('Quick links já existem — seed ignorado')
      return
    }

    // Atalho "Sessões Plenárias": canal do YouTube de Sumé (default) ou rota
    // interna genérica em câmara nova (sem vazar a URL específica de Sumé).
    const isSume = shouldSeedSumeContent()
    const sessionsLink = isSume
      ? {
          title: 'Sessões Plenárias',
          url: 'https://www.youtube.com/@camaramunicipaldeSume',
          icon: 'Youtube',
          color: 'red',
          displayOrder: 1,
          isActive: true,
        }
      : {
          title: 'Sessões Plenárias',
          url: '/sessoes',
          icon: 'Youtube',
          color: 'red',
          displayOrder: 1,
          isActive: true,
        }

    // Links rápidos padrão para câmara municipal
    const links = [
      sessionsLink,
      {
        title: 'Leis Municipais',
        url: '/leis',
        icon: 'Scale',
        color: 'navy',
        displayOrder: 2,
        isActive: true,
      },
      {
        title: 'Portal da Transparência',
        url: '/transparencia',
        icon: 'Shield',
        color: 'sky',
        displayOrder: 3,
        isActive: true,
      },
      {
        title: 'Diário Oficial',
        url: '/diario-oficial',
        icon: 'FileText',
        color: 'gold',
        displayOrder: 4,
        isActive: true,
      },
      {
        title: 'Vereadores',
        url: '/vereadores',
        icon: 'Users',
        color: 'emerald',
        displayOrder: 5,
        isActive: true,
      },
      {
        title: 'Ouvidoria',
        url: '/ouvidoria',
        icon: 'MessageSquare',
        color: 'purple',
        displayOrder: 6,
        isActive: true,
      },
    ]

    await QuickLink.createMany(links)
    console.log(`✓ ${links.length} links rápidos criados`)
  }
}
