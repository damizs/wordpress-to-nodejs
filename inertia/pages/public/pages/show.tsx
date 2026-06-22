import { PageLayout } from '~/components/PageLayout'
import { BlockRenderer, type PageBlock } from '~/components/blocks/BlockRenderer'
import { RichText } from '~/lib/rich_text'
import { Calendar } from 'lucide-react'

interface PageData {
  id: number
  title: string
  slug: string
  content: string | null
  blocks: PageBlock[] | null
  meta_description: string | null
  hero_subtitle: string | null
  published_at?: string | null
  updated_at?: string | null
}

interface Props {
  page: PageData
}

export default function PublicPageShow({ page }: Props) {
  const hasBlocks = Array.isArray(page.blocks) && page.blocks.length > 0
  const updatedAt = formatDate(page.updated_at || page.published_at || null)

  return (
    <PageLayout
      seo={{
        title: page.title,
        description: page.meta_description || page.hero_subtitle || undefined,
        url: `/${page.slug}`,
      }}
      breadcrumb={[{ label: page.title }]}
      hero={{ title: page.title, subtitle: page.hero_subtitle || undefined, centered: true }}
    >
      <article className="card-modern p-6 md:p-10">
        {updatedAt && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1.5 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4 text-gold" aria-hidden="true" />
            <span>Atualizado em: {updatedAt}</span>
          </div>
        )}
        {hasBlocks ? (
          <BlockRenderer blocks={page.blocks!} />
        ) : (
          <RichText text={page.content || ''} className="text-foreground/90" />
        )}
      </article>
    </PageLayout>
  )
}

function formatDate(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('pt-BR')
}
