import { sanitizeHtml } from '~/lib/sanitize_html'

export function SafeHtml({
  html,
  className = '',
}: {
  html: string | null | undefined
  className?: string
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
}
