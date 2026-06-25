import { defineConfig } from '@adonisjs/static'

/**
 * Configuration options to tweak the static files middleware.
 * The complete set of options are documented on the
 * official documentation website.
 *
 * https://docs.adonisjs.com/guides/static-assets
 */
const staticServerConfig = defineConfig({
  enabled: true,
  etag: true,
  lastModified: true,
  dotFiles: 'ignore',
  headers: (path: string) => {
    if (path.match(/\.svg$/i)) {
      // Defesa em profundidade: SVGs servidos diretamente são renderizados inline
      // pelo navegador. Caso um SVG chegue a public/uploads por outra via (import
      // WP/seed), neutraliza scripts embutidos sem quebrar SVGs de UI como imagem.
      return {
        'Cache-Control': 'public, max-age=2592000, immutable', // 30 days
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
        'X-Content-Type-Options': 'nosniff',
      }
    }
    if (path.match(/\.(jpg|jpeg|png|gif|webp|ico)$/i)) {
      return { 'Cache-Control': 'public, max-age=2592000, immutable' } // 30 days
    }
    if (path.match(/\.(css|js|woff2?|ttf)$/i)) {
      return { 'Cache-Control': 'public, max-age=31536000, immutable' } // 1 year
    }
    return {}
  },
})

export default staticServerConfig
