export const DEFAULT_PUBLIC_UNAVAILABLE_MESSAGE =
  'Este conteúdo está temporariamente indisponível para acesso público por decisão administrativa da Câmara Municipal. Permanecem acessíveis os serviços essenciais, transparência pública e canais de atendimento ao cidadão.'

/**
 * Modo de manutenção global — interruptor único que tira TODO o site público do
 * ar (mostrando a página `public/maintenance`), mantendo painel/login no ar e
 * permitindo que usuários autenticados continuem vendo o site real. É uma
 * EXTENSÃO da feature de disponibilidade pública (settings `maintenance_*`) e tem
 * PRECEDÊNCIA sobre os bloqueios granulares de área (`getPublicAccessBlock`).
 */
export const DEFAULT_MAINTENANCE_TITLE = 'Site em manutenção'
export const DEFAULT_MAINTENANCE_MESSAGE =
  'Estamos realizando melhorias e voltamos em breve. Obrigado pela compreensão.'

export interface MaintenanceBlock {
  title: string
  message: string
}

/** O modo de manutenção está ligado? (setting boolean 'true'/'false'). */
export function isMaintenanceModeOn(settings: Record<string, string | null | undefined>) {
  return settings.maintenance_mode === 'true'
}

/** Título + mensagem de manutenção, com os defaults institucionais. */
export function getMaintenanceBlock(
  settings: Record<string, string | null | undefined>
): MaintenanceBlock {
  return {
    title: settings.maintenance_title?.trim() || DEFAULT_MAINTENANCE_TITLE,
    message: settings.maintenance_message?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
  }
}

export const PUBLIC_ACCESS_AREAS = [
  {
    key: 'news',
    label: 'Notícias',
    description: 'Lista e detalhes de notícias institucionais.',
    paths: ['/noticias'],
  },
  {
    key: 'atas',
    label: 'Atas',
    description: 'Lista e detalhes das atas de sessões.',
    paths: ['/atas'],
  },
  {
    key: 'pautas',
    label: 'Pautas',
    description: 'Lista e detalhes das pautas de sessões.',
    paths: ['/pautas'],
  },
  {
    key: 'agenda',
    label: 'Agenda e sessões',
    description: 'Página pública da agenda legislativa.',
    paths: ['/agenda', '/agenda.ics'],
  },
  {
    key: 'activities',
    label: 'Atividades legislativas',
    description: 'Matérias e atividades legislativas publicadas.',
    paths: ['/atividades-legislativa', '/atividades-legislativas'],
  },
  {
    key: 'publications',
    label: 'Publicações oficiais',
    description: 'Atos e publicações institucionais próprias.',
    paths: ['/publicacoes-oficiais'],
  },
  {
    key: 'votings',
    label: 'Votações nominais',
    description: 'Painel público de votações nominais.',
    paths: ['/votacoes'],
  },
  {
    key: 'faq',
    label: 'Perguntas frequentes',
    description: 'Página pública de perguntas frequentes.',
    paths: ['/perguntas-frequentes'],
  },
  {
    key: 'videos',
    label: 'Vídeos',
    description: 'Galeria pública de vídeos.',
    paths: ['/videos'],
  },
] as const

export type PublicAccessAreaKey = (typeof PUBLIC_ACCESS_AREAS)[number]['key']

export interface PublicAccessBlock {
  areaKey: string | null
  title: string
  message: string
  path: string
  matchedRule: string | null
}

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean)
    }
  } catch {
    return []
  }

  return []
}

function parseList(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function normalizePublicPath(value: string) {
  const path = value.split('?')[0].split('#')[0].trim().toLowerCase()
  if (!path) return '/'

  const withSlash = path.startsWith('/') ? path : `/${path}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash
}

export function getDisabledPublicAreas(settings: Record<string, string | null | undefined>) {
  return new Set(parseJsonArray(settings.public_access_disabled_areas))
}

export function publicUnavailableMessage(settings: Record<string, string | null | undefined>) {
  const message = settings.public_unavailable_message?.trim()
  return message || DEFAULT_PUBLIC_UNAVAILABLE_MESSAGE
}

export function getBlockedPublicPaths(settings: Record<string, string | null | undefined>) {
  return parseList(settings.public_access_blocked_paths).map(normalizePublicPath)
}

function pathMatchesRule(path: string, rule: string) {
  const normalizedPath = normalizePublicPath(path)
  const isWildcard = rule.endsWith('/*')
  const normalizedRule = normalizePublicPath(isWildcard ? rule.slice(0, -2) : rule)

  if (normalizedPath === normalizedRule) return true
  if (isWildcard) return normalizedPath.startsWith(`${normalizedRule}/`)
  return normalizedPath.startsWith(`${normalizedRule}/`)
}

export function getPublicAccessBlock(
  settings: Record<string, string | null | undefined>,
  requestPath: string
): PublicAccessBlock | null {
  const path = normalizePublicPath(requestPath)
  const message = publicUnavailableMessage(settings)
  const disabledAreas = getDisabledPublicAreas(settings)

  for (const area of PUBLIC_ACCESS_AREAS) {
    if (!disabledAreas.has(area.key)) continue
    if (!area.paths.some((areaPath) => pathMatchesRule(path, areaPath))) continue

    return {
      areaKey: area.key,
      title: area.label,
      message,
      path,
      matchedRule: area.key,
    }
  }

  for (const rule of getBlockedPublicPaths(settings)) {
    if (!pathMatchesRule(path, rule)) continue
    return {
      areaKey: null,
      title: 'Conteúdo temporariamente indisponível',
      message,
      path,
      matchedRule: rule,
    }
  }

  return null
}
