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
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
      return { 'Cache-Control': 'public, max-age=2592000, immutable' } // 30 days
    }
    if (path.match(/\.(css|js|woff2?|ttf)$/i)) {
      return { 'Cache-Control': 'public, max-age=31536000, immutable' } // 1 year
    }
    return {}
  },
})

export default staticServerConfig
