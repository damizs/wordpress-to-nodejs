import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import { camara as camaraConfig } from '#config/camara'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  sharedData: {
    auth: (ctx) =>
      ctx.inertia.always(async () => {
        try {
          const user = ctx.auth?.user
          if (!user) return { user: null, permissions: [] }
          return {
            user: {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              role: user.role,
            },
            permissions: await user.getPermissionNames(),
          }
        } catch {
          return { user: null, permissions: [] }
        }
      }),
    flash: (ctx) =>
      ctx.inertia.always(() => {
        try {
          const session = ctx.session
          if (!session || typeof session.flashMessages?.get !== 'function') {
            return { success: null, error: null }
          }
          return {
            success: session.flashMessages.get('success') ?? null,
            error: session.flashMessages.get('error') ?? null,
          }
        } catch {
          return { success: null, error: null }
        }
      }),
    siteSettings: async () => {
      try {
        const { default: SiteSetting } = await import('#models/site_setting')
        return await SiteSetting.allAsObject()
      } catch {
        return {}
      }
    },
    // Identidade da câmara (config/camara) disponível em TODAS as páginas Inertia
    // via `usePage().props.camara` — substitui "Sumé" chumbado no frontend. É
    // config pura (env com DEFAULT = Sumé), então para Sumé nada muda. Apenas os
    // campos públicos de identidade (sem e-mail/integrações).
    camara: () => ({
      nome: camaraConfig.nome,
      nomeCurto: camaraConfig.nomeCurto,
      cidade: camaraConfig.cidade,
      uf: camaraConfig.uf,
      baseUrl: camaraConfig.baseUrl,
      siteUrl: camaraConfig.siteUrl,
    }),
  },

  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
