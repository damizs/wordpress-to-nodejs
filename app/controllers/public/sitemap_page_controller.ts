import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'
import {
  DEFAULT_HEADER_MENU,
  DEFAULT_FOOTER_COLUMNS,
  type MenuItem,
} from '#controllers/admin/menus_controller'
import { getPublicAccessBlock } from '#helpers/public_access'

interface SitemapLink {
  label: string
  href: string
}

interface SitemapGroup {
  title: string
  links: SitemapLink[]
}

function parseMenu(raw: string | null): MenuItem[] {
  if (!raw) return DEFAULT_HEADER_MENU
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_HEADER_MENU
    return parsed.filter((i: any) => i && i.label && i.href)
  } catch {
    return DEFAULT_HEADER_MENU
  }
}

/** Rotas públicas conhecidas que podem não constar no menu dinâmico */
const KNOWN_GROUPS: SitemapGroup[] = [
  {
    title: 'A Câmara',
    links: [
      { label: 'História da Câmara', href: '/historia-da-camara' },
      { label: 'Sobre', href: '/sobre' },
      { label: 'Vereadores', href: '/vereadores' },
      { label: 'Mesa Diretora', href: '/mesa-diretora' },
      { label: 'Comissões Permanentes', href: '/comissoes' },
    ],
  },
  {
    title: 'Transparência',
    links: [
      { label: 'Portal da Transparência', href: '/transparencia' },
      { label: 'Duodécimos', href: '/duodecimos' },
      { label: 'Licitações', href: '/licitacoes' },
      { label: 'Votações Nominais', href: '/votacoes' },
      { label: 'Dados Abertos', href: '/dados-abertos' },
    ],
  },
  {
    title: 'Documentos',
    links: [
      { label: 'Atividades Legislativas', href: '/atividades-legislativas' },
      { label: 'Agenda de Sessões', href: '/agenda' },
      { label: 'Atas das Sessões', href: '/atas' },
      { label: 'Pautas', href: '/pautas' },
      { label: 'Publicações Oficiais', href: '/publicacoes-oficiais' },
      { label: 'Diário Oficial', href: '/diario-oficial' },
      { label: 'Leis Municipais', href: '/leis' },
    ],
  },
  {
    title: 'Cidadão',
    links: [
      { label: 'Ouvidoria', href: '/ouvidoria' },
      { label: 'Perguntas Frequentes', href: '/perguntas-frequentes' },
      { label: 'Pesquisa de Satisfação', href: '/pesquisa-de-satisfacao' },
      { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
      { label: 'Mapa do Site', href: '/mapa-do-site' },
    ],
  },
  {
    title: 'Notícias',
    links: [{ label: 'Todas as Notícias', href: '/noticias' }],
  },
]

export default class SitemapPageController {
  async index({ inertia }: HttpContext) {
    const settings = await SiteSetting.allAsObject()
    const menu = parseMenu(settings.header_menu)

    const groups: SitemapGroup[] = []
    const seen = new Set<string>()
    const isAvailable = (href: string) => {
      if (!href.startsWith('/')) return true
      return !getPublicAccessBlock(settings, href)
    }

    const addGroup = (title: string, links: SitemapLink[]) => {
      const fresh = links.filter((l) => {
        if (!isAvailable(l.href)) return false
        if (seen.has(l.href)) return false
        seen.add(l.href)
        return true
      })
      if (fresh.length === 0) return
      const existing = groups.find((g) => g.title === title)
      if (existing) {
        existing.links.push(...fresh)
      } else {
        groups.push({ title, links: fresh })
      }
    }

    // 1) Itens do menu dinâmico: dropdowns viram grupos; itens simples vão para "Navegação"
    const topLevel: SitemapLink[] = []
    for (const item of menu) {
      if (Array.isArray(item.children) && item.children.length > 0) {
        addGroup(
          item.label,
          item.children.map((c) => ({ label: c.label, href: c.href }))
        )
      } else if (item.href !== '/') {
        topLevel.push({ label: item.label, href: item.href })
      }
    }

    // 2) Rotas públicas conhecidas (complementa o que não estiver no menu)
    for (const group of KNOWN_GROUPS) {
      addGroup(group.title, group.links)
    }

    // 3) Itens de topo do menu que sobraram (sem duplicar)
    addGroup('Navegação', topLevel)

    // 4) Colunas do rodapé (links extras configurados no painel)
    for (const column of DEFAULT_FOOTER_COLUMNS) {
      addGroup(column.title, column.links)
    }

    return inertia.render('public/mapa-do-site/index', { groups })
  }
}
