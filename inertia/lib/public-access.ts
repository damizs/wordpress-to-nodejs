export const DEFAULT_PUBLIC_UNAVAILABLE_MESSAGE =
  "Este conteúdo está temporariamente indisponível para acesso público por decisão administrativa da Câmara Municipal. Permanecem acessíveis os serviços essenciais, transparência pública e canais de atendimento ao cidadão.";

/**
 * Defaults do MODO DE MANUTENÇÃO global (espelham app/helpers/public_access.ts).
 * Usados na página `public/maintenance` e na aba "Disponibilidade pública".
 */
export const DEFAULT_MAINTENANCE_TITLE = "Site em manutenção";
export const DEFAULT_MAINTENANCE_MESSAGE =
  "Estamos realizando melhorias e voltamos em breve. Obrigado pela compreensão.";

export const PUBLIC_ACCESS_AREAS = [
  {
    key: "news",
    label: "Notícias",
    description: "Lista e detalhes de notícias institucionais.",
    paths: ["/noticias"],
  },
  {
    key: "atas",
    label: "Atas",
    description: "Lista e detalhes das atas de sessões.",
    paths: ["/atas"],
  },
  {
    key: "pautas",
    label: "Pautas",
    description: "Lista e detalhes das pautas de sessões.",
    paths: ["/pautas"],
  },
  {
    key: "agenda",
    label: "Agenda e sessões",
    description: "Página pública da agenda legislativa.",
    paths: ["/agenda", "/agenda.ics"],
  },
  {
    key: "activities",
    label: "Atividades legislativas",
    description: "Matérias e atividades legislativas publicadas.",
    paths: ["/atividades-legislativa", "/atividades-legislativas"],
  },
  {
    key: "publications",
    label: "Publicações oficiais",
    description: "Atos e publicações institucionais próprias.",
    paths: ["/publicacoes-oficiais"],
  },
  {
    key: "votings",
    label: "Votações nominais",
    description: "Painel público de votações nominais.",
    paths: ["/votacoes"],
  },
  {
    key: "faq",
    label: "Perguntas frequentes",
    description: "Página pública de perguntas frequentes.",
    paths: ["/perguntas-frequentes"],
  },
  {
    key: "videos",
    label: "Vídeos",
    description: "Galeria pública de vídeos.",
    paths: ["/videos"],
  },
] as const;

export type PublicAccessAreaKey = (typeof PUBLIC_ACCESS_AREAS)[number]["key"];

export function parseDisabledPublicAreas(value: string | null | undefined) {
  if (!value) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    return [] as string[];
  }
  return [] as string[];
}

export function serializeDisabledPublicAreas(keys: string[]) {
  return JSON.stringify(Array.from(new Set(keys)).sort());
}

export function isPublicAreaDisabled(value: string | null | undefined, key: string) {
  return parseDisabledPublicAreas(value).includes(key);
}

export function togglePublicArea(value: string | null | undefined, key: string, disabled: boolean) {
  const current = new Set(parseDisabledPublicAreas(value));
  if (disabled) current.add(key);
  else current.delete(key);
  return serializeDisabledPublicAreas(Array.from(current));
}

function normalizePublicPath(value: string) {
  const path = value.split("?")[0].split("#")[0].trim().toLowerCase();
  if (!path) return "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
}

function parseBlockedPublicPaths(value: string | null | undefined) {
  if (!value) return [] as string[];
  return value
    .split(/[\n,;]/)
    .map((item) => normalizePublicPath(item))
    .filter(Boolean);
}

function pathMatchesRule(path: string, rule: string) {
  const normalizedPath = normalizePublicPath(path);
  const isWildcard = rule.endsWith("/*");
  const normalizedRule = normalizePublicPath(isWildcard ? rule.slice(0, -2) : rule);

  if (normalizedPath === normalizedRule) return true;
  if (isWildcard) return normalizedPath.startsWith(`${normalizedRule}/`);
  return normalizedPath.startsWith(`${normalizedRule}/`);
}

export function isPublicHrefBlocked(
  settings: Record<string, string | null | undefined>,
  href: string | null | undefined
) {
  if (!href) return false;
  const trimmed = href.trim();
  if (!trimmed || trimmed === "/" || trimmed.startsWith("#")) return false;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return false;

  const disabled = new Set(parseDisabledPublicAreas(settings.public_access_disabled_areas));
  for (const area of PUBLIC_ACCESS_AREAS) {
    if (!disabled.has(area.key)) continue;
    if (area.paths.some((path) => pathMatchesRule(trimmed, path))) return true;
  }

  return parseBlockedPublicPaths(settings.public_access_blocked_paths).some((path) =>
    pathMatchesRule(trimmed, path)
  );
}
