import { SeoHead } from '~/components/SeoHead'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageHero } from '~/components/PageHero'
import { Footer } from '~/components/Footer'
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
    <>
      <SeoHead
        title={page.title}
        description={page.meta_description || page.hero_subtitle || undefined}
        url={`/${page.slug}`}
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: page.title }]} />
        <PageHero title={page.title} subtitle={page.hero_subtitle || undefined} centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                <article className="card-modern p-6 md:p-10">
                  {hasBlocks ? (
                    <BlockRenderer blocks={page.blocks!} />
                  ) : (
                    <RichText text={page.content || ''} className="text-foreground/90" />
                  )}
                </article>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}
