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

const materiaLinks = [
  { label: 'Atividades Legislativas', href: '/atividades-legislativas' },
  { label: 'Atas das Sessões', href: '/atas' },
  { label: 'Pautas', href: '/pautas' },
  { label: 'Publicações Oficiais', href: '/publicacoes-oficiais' },
]

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
    ],
  },
  {
    label: 'Matérias',
    href: '/atividades-legislativas',
    children: materiaLinks,
  },
  { label: 'Licitações', href: '/licitacoes' },
  { label: 'Transparência', href: '/transparencia' },
  { label: 'Notícias', href: '/noticias' },
  {
    label: 'Cidadão',
    href: '/ouvidoria',
    children: [
      { label: 'Ouvidoria', href: '/ouvidoria' },
      { label: 'E-SIC', href: '/#esic' },
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
      { label: 'E-SIC', href: '/#esic' },
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

const materiaHrefs = new Set(materiaLinks.map((item) => item.href))

function normalizeLabel(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function isLicitationItem(item: MenuItem) {
  const label = normalizeLabel(item.label)
  return item.href === '/licitacoes' || label.includes('licitacao') || label.includes('licitacoes')
}

function reorderPrimaryMenu(items: MenuItem[]): MenuItem[] {
  const withoutLicitation = items.filter((item) => !isLicitationItem(item))
  const licitation = items.find(isLicitationItem) ?? { label: 'Licitações', href: '/licitacoes' }
  const transparencyIndex = withoutLicitation.findIndex((item) =>
    normalizeLabel(item.label).includes('transparencia')
  )

  if (transparencyIndex >= 0) {
    withoutLicitation.splice(transparencyIndex, 0, licitation)
    return withoutLicitation
  }

  withoutLicitation.splice(Math.min(3, withoutLicitation.length), 0, licitation)
  return withoutLicitation
}

export function normalizeHeaderMenu(items: MenuItem[]): MenuItem[] {
  const materialChildren: { label: string; href: string }[] = []
  const normalized = items
    .map((item) => {
      const keptChildren: { label: string; href: string }[] = []
      for (const child of item.children ?? []) {
        if (materiaHrefs.has(child.href)) {
          if (!materialChildren.some((existing) => existing.href === child.href)) {
            materialChildren.push(child)
          }
        } else {
          keptChildren.push(child)
        }
      }

      if (materiaHrefs.has(item.href)) {
        if (!materialChildren.some((existing) => existing.href === item.href)) {
          materialChildren.push({ label: item.label, href: item.href })
        }
        return null
      }

      return {
        ...item,
        ...(keptChildren.length > 0 ? { children: keptChildren } : { children: undefined }),
      }
    })
    .filter((item): item is MenuItem => item !== null)

  const children = materiaLinks.map(
    (fallback) => materialChildren.find((item) => item.href === fallback.href) ?? fallback
  )
  const existingIndex = normalized.findIndex((item) => normalizeLabel(item.label).includes('materia'))
  if (existingIndex >= 0) {
    normalized[existingIndex] = {
      ...normalized[existingIndex],
      href: normalized[existingIndex].href || '/atividades-legislativas',
      children,
    }
    return reorderPrimaryMenu(normalized)
  }

  const insertAfter = normalized.findIndex((item) => normalizeLabel(item.label).includes('camara'))
  normalized.splice(insertAfter >= 0 ? insertAfter + 1 : 1, 0, {
    label: 'Matérias',
    href: '/atividades-legislativas',
    children,
  })

  return reorderPrimaryMenu(normalized)
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

/**
 * Agrupamento automático do menu (Matérias/Licitações) é OPCIONAL.
 * Setting `menu_auto_group` (default = ligado, comportamento histórico). Quando
 * DESLIGADO ('false'), respeita a ordem exata definida pelo cliente no painel.
 */
function isAutoGroupEnabled(raw: string | null | undefined): boolean {
  return raw !== 'false'
}

export default class MenusController {
  async index({ inertia }: HttpContext) {
    const autoGroup = isAutoGroupEnabled(await SiteSetting.getValue('menu_auto_group'))
    const storedHeader = parseJson<MenuItem[]>(
      await SiteSetting.getValue('header_menu'),
      DEFAULT_HEADER_MENU
    )
    const headerMenu = autoGroup ? normalizeHeaderMenu(storedHeader) : storedHeader
    const footerColumns = parseJson<FooterColumn[]>(
      await SiteSetting.getValue('footer_columns'),
      DEFAULT_FOOTER_COLUMNS
    )
    return inertia.render('admin/menus/index', {
      headerMenu,
      footerColumns,
      menuAutoGroup: autoGroup,
    })
  }

  async update({ request, response, session }: HttpContext) {
    try {
      // Aceita boolean (true/false) ou string ('true'/'false') vinda do formulário.
      const toggle = request.input('menu_auto_group', true)
      const autoGroup = toggle !== false && toggle !== 'false'

      const cleaned = cleanMenu(request.input('header_menu', []))
      // Só reagrupa quando o agrupamento automático está ligado; caso contrário,
      // grava exatamente a ordem que o cliente montou (arrastando) no painel.
      const headerMenu = autoGroup ? normalizeHeaderMenu(cleaned) : cleaned
      const footerColumns = cleanColumns(request.input('footer_columns', []))

      if (headerMenu.length === 0) {
        session.flash('error', 'O menu do site precisa de pelo menos um item.')
        return response.redirect().back()
      }

      await SiteSetting.setValue('header_menu', JSON.stringify(headerMenu), 'menus', 'json')
      await SiteSetting.setValue('footer_columns', JSON.stringify(footerColumns), 'menus', 'json')
      await SiteSetting.setValue('menu_auto_group', autoGroup ? 'true' : 'false', 'menus', 'boolean')

      session.flash('success', 'Menus atualizados com sucesso!')
    } catch (error) {
      console.error('Error saving menus:', error)
      session.flash('error', 'Erro ao salvar os menus. Tente novamente.')
    }
    return response.redirect().back()
  }

  /** Restaura os menus padrão (e o agrupamento automático ligado). */
  async reset({ response, session }: HttpContext) {
    await SiteSetting.setValue('header_menu', null, 'menus', 'json')
    await SiteSetting.setValue('footer_columns', null, 'menus', 'json')
    await SiteSetting.setValue('menu_auto_group', null, 'menus', 'boolean')
    session.flash('success', 'Menus restaurados para o padrão.')
    return response.redirect().back()
  }
}
