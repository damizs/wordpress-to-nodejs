import { BaseSchema } from '@adonisjs/lucid/schema'

const materiaLinks = [
  { label: 'Atividades Legislativas', href: '/atividades-legislativas' },
  { label: 'Atas das Sessões', href: '/atas' },
  { label: 'Pautas', href: '/pautas' },
  { label: 'Publicações Oficiais', href: '/publicacoes-oficiais' },
]

const materiaHrefs = new Set(materiaLinks.map((item) => item.href))

type MenuItemRow = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

function normalizeLabel(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizeHeaderMenu(items: any[]) {
  const materialChildren: { label: string; href: string }[] = []
  const normalized: MenuItemRow[] = items
    .map((item) => {
      if (!item?.label || !item?.href) return null

      const keptChildren: { label: string; href: string }[] = []
      for (const child of item.children ?? []) {
        if (!child?.label || !child?.href) continue
        if (materiaHrefs.has(child.href)) {
          if (!materialChildren.some((existing) => existing.href === child.href)) {
            materialChildren.push({ label: child.label, href: child.href })
          }
        } else {
          keptChildren.push({ label: child.label, href: child.href })
        }
      }

      if (materiaHrefs.has(item.href)) {
        if (!materialChildren.some((existing) => existing.href === item.href)) {
          materialChildren.push({ label: item.label, href: item.href })
        }
        return null
      }

      return {
        label: item.label,
        href: item.href,
        ...(keptChildren.length > 0 ? { children: keptChildren } : {}),
      }
    })
    .filter((item): item is MenuItemRow => item !== null)

  const children = materiaLinks.map(
    (fallback) => materialChildren.find((item) => item.href === fallback.href) ?? fallback
  )
  const existingIndex = normalized.findIndex((item: any) =>
    normalizeLabel(item.label).includes('materia')
  )

  if (existingIndex >= 0) {
    normalized[existingIndex] = {
      ...normalized[existingIndex],
      href: normalized[existingIndex]!.href || '/atividades-legislativas',
      children,
    }
    return normalized
  }

  const insertAfter = normalized.findIndex((item: any) => normalizeLabel(item.label).includes('camara'))
  normalized.splice(insertAfter >= 0 ? insertAfter + 1 : 1, 0, {
    label: 'Matérias',
    href: '/atividades-legislativas',
    children,
  })

  return normalized
}

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const row = await db.from('site_settings').where('key', 'header_menu').first()
      if (!row?.value) return

      try {
        const menu = JSON.parse(row.value)
        if (!Array.isArray(menu) || menu.length === 0) return

        await db
          .from('site_settings')
          .where('key', 'header_menu')
          .update({ value: JSON.stringify(normalizeHeaderMenu(menu)) })
      } catch {
        /* JSON inválido: deixa como está para o front cair no fallback. */
      }
    })
  }

  async down() {
    // Não desfaz: o menu pode ter sido reorganizado manualmente no painel.
  }
}
