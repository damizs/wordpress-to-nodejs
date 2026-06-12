import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Mapa do Site e Dados Abertos entraram nos menus PADRÃO, mas quem já salvou
 * um menu personalizado em /painel/menus não os recebe. Esta migration
 * injeta os dois itens no JSON salvo (idempotente: só adiciona se o href
 * ainda não existir em lugar nenhum do menu).
 */
export default class extends BaseSchema {
  private newItems = [
    { label: 'Mapa do Site', href: '/mapa-do-site' },
    { label: 'Dados Abertos', href: '/dados-abertos' },
  ]

  async up() {
    this.defer(async (db) => {
      // ---- header_menu: injeta no submenu "Cidadão" (ou no último item com children)
      const headerRow = await db
        .from('site_settings')
        .where('key', 'header_menu')
        .first()
      if (headerRow?.value) {
        try {
          const menu = JSON.parse(headerRow.value)
          if (Array.isArray(menu) && menu.length > 0) {
            const allHrefs = new Set<string>()
            for (const item of menu) {
              if (item?.href) allHrefs.add(item.href)
              for (const child of item?.children ?? []) {
                if (child?.href) allHrefs.add(child.href)
              }
            }
            const missing = this.newItems.filter((i) => !allHrefs.has(i.href))
            if (missing.length > 0) {
              const target =
                menu.find((i: any) => i?.label === 'Cidadão' && Array.isArray(i.children)) ??
                [...menu].reverse().find((i: any) => Array.isArray(i?.children))
              if (target) {
                target.children.push(...missing)
              } else {
                menu.push(...missing)
              }
              await db
                .from('site_settings')
                .where('key', 'header_menu')
                .update({ value: JSON.stringify(menu) })
            }
          }
        } catch {
          /* JSON inválido: deixa como está (front cai no padrão) */
        }
      }

      // ---- footer_columns: injeta na coluna "Links Úteis" (ou na primeira)
      const footerRow = await db
        .from('site_settings')
        .where('key', 'footer_columns')
        .first()
      if (footerRow?.value) {
        try {
          const columns = JSON.parse(footerRow.value)
          if (Array.isArray(columns) && columns.length > 0) {
            const allHrefs = new Set<string>()
            for (const col of columns) {
              for (const link of col?.links ?? []) {
                if (link?.href) allHrefs.add(link.href)
              }
            }
            const missing = this.newItems.filter((i) => !allHrefs.has(i.href))
            if (missing.length > 0) {
              const target =
                columns.find((c: any) => c?.title === 'Links Úteis' && Array.isArray(c.links)) ??
                columns.find((c: any) => Array.isArray(c?.links))
              if (target) {
                target.links.push(...missing)
                await db
                  .from('site_settings')
                  .where('key', 'footer_columns')
                  .update({ value: JSON.stringify(columns) })
              }
            }
          }
        } catch {
          /* idem */
        }
      }
    })
  }

  async down() {
    // Não remove: os itens podem ter sido reordenados/editados no painel.
  }
}
