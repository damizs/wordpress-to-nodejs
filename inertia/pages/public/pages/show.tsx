import { PageLayout } from '~/components/PageLayout'
import { BlockRenderer, type PageBlock } from '~/components/blocks/BlockRenderer'
import { RichText } from '~/lib/rich_text'

interface PageData {
  id: number
  title: string
  slug: string
  content: string | null
  blocks: PageBlock[] | null
  meta_description: string | null
  hero_subtitle: string | null
}

interface Props {
  page: PageData
}

export default function PublicPageShow({ page }: Props) {
  const hasBlocks = Array.isArray(page.blocks) && page.blocks.length > 0

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
        {hasBlocks ? (
          <BlockRenderer blocks={page.blocks!} />
        ) : (
          <RichText text={page.content || ''} className="text-foreground/90" />
        )}
      </article>
    </PageLayout>
  )
}
