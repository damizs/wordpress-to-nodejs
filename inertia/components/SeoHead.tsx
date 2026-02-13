import { Head } from '@inertiajs/react'

interface SeoHeadProps {
  title: string
  description?: string
  image?: string | null
  url?: string
  type?: 'website' | 'article'
  publishedAt?: string | null
  noindex?: boolean
}

const SITE_NAME = 'Câmara Municipal de Sumé'
const BASE_URL = 'https://node.camaradesume.pb.gov.br'
const DEFAULT_DESC = 'Portal oficial da Câmara Municipal de Sumé - PB. Transparência, notícias, atividades legislativas e serviços ao cidadão.'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`

export default function SeoHead({
  title,
  description = DEFAULT_DESC,
  image,
  url,
  type = 'website',
  publishedAt,
  noindex = false,
}: SeoHeadProps) {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
  const ogImage = image ? (image.startsWith('http') ? image : `${BASE_URL}${image}`) : DEFAULT_IMAGE
  const canonical = url ? (url.startsWith('http') ? url : `${BASE_URL}${url}`) : undefined

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Article specific */}
      {type === 'article' && publishedAt && (
        <meta property="article:published_time" content={publishedAt} />
      )}
      {type === 'article' && (
        <meta property="article:publisher" content={BASE_URL} />
      )}

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}
    </Head>
  )
}
