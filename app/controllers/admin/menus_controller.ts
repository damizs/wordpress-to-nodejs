import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'

export interface MenuItem {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

/** Defaults = menu que era hardcoded no Header.tsx/Footer.tsx */
export const DEFAULT_HEADER_MENU: MenuItem[] = [
  { label: 'Início', href: '/' },
  {
    label: 'A Câmara',
    href: '/historia-da-camara',
    children: [
      { label: 'História da Câmara', href: '/historia-da-camara' },
      { label: 'Vereadores', href: '/vereadores' },
      { label: 'Mesa Diretora', href: '/mesa-diretora' },
      { label: 'Comissões Permanentes', href: '/comissoes' },
      { label: 'Atividades Legislativas', href: '/atividades-legislativas' },
      { label: 'Atas das Sessões', href: '/atas' },
      { label: 'Pautas', href: '/pautas' },
      { label: 'Publicações Oficiais', href: '/publicacoes-oficiais' },
    ],
  },
  { label: 'Transparência', href: '/transparencia' },
  { label: 'Licitações', href: '/licitacoes' },
  { label: 'Notícias', href: '/noticias' },
  {
    label: 'Cidadão',
    href: '/ouvidoria',
    children: [
      { label: 'Ouvidoria', href: '/ouvidoria' },
      { label: 'Perguntas Frequentes', href: '/perguntas-frequentes' },
      { label: 'Pesquisa de Satisfação', href: '/pesquisa-de-satisfacao' },
      { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
      { label: 'Mapa do Site', href: '/mapa-do-site' },
      { label: 'Dados Abertos', href: '/dados-abertos' },
    ],
  },
]

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Links Úteis',
    links: [
      { label: 'Portal da Transparência', href: '/transparencia' },
      { label: 'Duodécimos', href: '/duodecimos' },
      { label: 'E-SIC', href: '/transparencia' },
      { label: 'Ouvidoria', href: '/ouvidoria' },
      { label: 'Licitações', href: '/licitacoes' },
      { label: 'Vereadores', href: '/vereadores' },
      { label: 'Atas', href: '/atas' },
      { label: 'Mapa do Site', href: '/mapa-do-site' },
      { label: 'Dados Abertos', href: '/dados-abertos' },
    ],
  },
  {
    title: 'Institucional',
    links: [
      { label: 'A Câmara', href: '/historia-da-camara' },
      { label: 'Mesa Diretora', href: '/mesa-diretora' },
      { label: 'Comissões', href: '/comissoes' },
      { label: 'Publicações Oficiais', href: '/publicacoes-oficiais' },
      { label: 'Leis Municipais', href: '/leis' },
      { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
    ],
  },
]

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T) : fallback
  } catch {
    return fallback
  }
}

/** Sanitiza itens: descarta entradas sem label/href */
function cleanMenu(items: any[]): MenuItem[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((i) => i && typeof i.label === 'string' && i.label.trim() && typeof i.href === 'string')
    .map((i) => ({
      label: i.label.trim(),
      href: i.href.trim() || '/',
      ...(Array.isArray(i.children) && i.children.length > 0
        ? {
            children: i.children
              .filter(
                (c: any) =>
                  c && typeof c.label === 'string' && c.label.trim() && typeof c.href === 'string'
              )
              .map((c: any) => ({ label: c.label.trim(), href: c.href.trim() || '/' })),
          }
        : {}),
    }))
}

function cleanColumns(cols: any[]): FooterColumn[] {
  if (!Array.isArray(cols)) return []
  return cols
    .filter((c) => c && typeof c.title === 'string' && c.title.trim())
    .map((c) => ({
      title: c.title.trim(),
      links: Array.isArray(c.links)
        ? c.links
            .filter(
              (l: any) =>
                l && typeof l.label === 'string' && l.label.trim() && typeof l.href === 'string'
            )
            .map((l: any) => ({ label: l.label.trim(), href: l.href.trim() || '/' }))
        : [],
    }))
}

export default class MenusController {
  async index({ inertia }: HttpContext) {
    const headerMenu = parseJson<MenuItem[]>(
      await SiteSetting.getValue('header_menu'),
      DEFAULT_HEADER_MENU
    )
    const footerColumns = parseJson<FooterColumn[]>(
      await SiteSetting.getValue('footer_columns'),
      DEFAULT_FOOTER_COLUMNS
    )
    return inertia.render('admin/menus/index', { headerMenu, footerColumns })
  }

  async update({ request, response, session }: HttpContext) {
    try {
      const headerMenu = cleanMenu(request.input('header_menu', []))
      const footerColumns = cleanColumns(request.input('footer_columns', []))

      if (headerMenu.length === 0) {
        session.flash('error', 'O menu do site precisa de pelo menos um item.')
        return response.redirect().back()
      }

      await SiteSetting.setValue('header_menu', JSON.stringify(headerMenu), 'menus', 'json')
      await SiteSetting.setValue('footer_columns', JSON.stringify(footerColumns), 'menus', 'json')

      session.flash('success', 'Menus atualizados com sucesso!')
    } catch (error) {
      console.error('Error saving menus:', error)
      session.flash('error', 'Erro ao salvar os menus. Tente novamente.')
    }
    return response.redirect().back()
  }

  /** Restaura os menus padrão */
  async reset({ response, session }: HttpContext) {
    await SiteSetting.setValue('header_menu', null, 'menus', 'json')
    await SiteSetting.setValue('footer_columns', null, 'menus', 'json')
    session.flash('success', 'Menus restaurados para o padrão.')
    return response.redirect().back()
  }
}
