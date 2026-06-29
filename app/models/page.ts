import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/**
 * Bloco de conteúdo de uma Página (módulo "Páginas" estilo WordPress).
 * Espelha os tipos do renderer público em inertia/components/blocks/BlockRenderer.tsx.
 */
export type PageBlock =
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; caption?: string; full?: boolean }
  | { type: 'documents'; items: { label: string; url: string }[] }
  | { type: 'accordion'; items: { title: string; body: string }[] }
  | { type: 'callout'; tone: 'info' | 'warning' | 'success'; text: string }
  | { type: 'buttons'; items: { label: string; url: string; variant: 'primary' | 'secondary' }[] }
  | { type: 'video'; url: string }
  | { type: 'columns'; layout: string; columns: PageBlock[][] }

export default class Page extends BaseModel {
  static table = 'pages'
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare slug: string
  /** Texto legado (markdown-lite) — usado como fallback quando não há blocos */
  @column() declare content: string

  /** Conteúdo em blocos (JSON array). O driver pg pode devolver objeto ou string. */
  @column({
    prepare: (value: PageBlock[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: unknown): PageBlock[] | null => {
      if (!value) return null
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          return Array.isArray(parsed) ? parsed : null
        } catch {
          return null
        }
      }
      return Array.isArray(value) ? (value as PageBlock[]) : null
    },
  })
  declare blocks: PageBlock[] | null

  @column() declare metaDescription: string | null
  @column() declare heroSubtitle: string | null
  @column() declare isPublished: boolean
  @column.dateTime() declare publishedAt: DateTime | null
  @column.dateTime() declare deletedAt: DateTime | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
