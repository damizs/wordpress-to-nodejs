import { SafeHtml } from '~/components/SafeHtml'

/**
 * Componente canônico para renderizar HTML institucional / vindo do WordPress
 * (notícias, atas, pautas, atividades legislativas, publicações, biografias...).
 *
 * Encapsula <SafeHtml> com as classes "boas":
 *   - wrapper `.rich-content` (refinos dark-safe em inertia/css/app.css);
 *   - `prose prose-slate dark:prose-invert max-w-none` (tipografia);
 *   - SEM `text-justify` — alinhamento natural à esquerda (texto legal legível,
 *     sem "rios" de espaço). A sanitização (sanitize_html) já remove parágrafos
 *     vazios, scripts/estilos e é SSR-safe.
 *
 * Use SEMPRE este componente no lugar de chamar <SafeHtml className="prose ...">
 * diretamente. `className` opcional concatena (ex.: "prose-lg", "text-sm").
 */
export function RichContent({
  html,
  className = '',
}: {
  html: string | null | undefined
  className?: string
}) {
  const base = 'rich-content prose prose-slate dark:prose-invert max-w-none'
  return <SafeHtml html={html} className={className ? `${base} ${className}` : base} />
}
