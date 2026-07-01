import { defineConfig } from '@adonisjs/shield'
import { camara } from '#config/camara'

const tenantFrameSources = [camara.siteUrl, camara.baseUrl].filter(Boolean)

const trustedFrameSources = [
  "'self'",
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://www.instagram.com',
  'https://platform.instagram.com',
  'https://vlibras.gov.br',
  'https://www.vlibras.gov.br',
  'https://getpublic.inf.br',
  'https://portaldatransparencia.publicsoft.com.br',
  'https://transparencia.elmartecnologia.com.br',
  ...tenantFrameSources,
]

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more
   */
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://vlibras.gov.br',
        'https://www.vlibras.gov.br',
        'https://www.youtube.com',
        'https://www.instagram.com',
        'https://platform.instagram.com',
        // Cloudflare Web Analytics: o beacon é injetado pela borda do Cloudflare
        // quando o domínio está atrás dele. Sem liberar, o CSP bloqueia o script.
        'https://static.cloudflareinsights.com',
      ],
      scriptSrcElem: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://vlibras.gov.br',
        'https://www.vlibras.gov.br',
        'https://www.youtube.com',
        'https://www.instagram.com',
        'https://platform.instagram.com',
        'https://static.cloudflareinsights.com',
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      mediaSrc: ["'self'", 'blob:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      frameSrc: trustedFrameSources,
      childSrc: trustedFrameSources,
      workerSrc: ["'self'", 'blob:'],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
    },
    reportOnly: false,
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more
   */
  csrf: {
    enabled: true,
    exceptRoutes: [],
    enableXsrfCookie: true,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Control how your website should be embedded inside
   * iFrames
   */
  xFrame: {
    enabled: true,
    action: 'SAMEORIGIN',
  },

  /**
   * Force browser to always use HTTPS
   */
  hsts: {
    enabled: true,
    maxAge: '180 days',
  },

  /**
   * Disable browsers from sniffing the content type of a
   * response and always rely on the "content-type" header.
   */
  contentTypeSniffing: {
    enabled: true,
  },
})

export default shieldConfig
