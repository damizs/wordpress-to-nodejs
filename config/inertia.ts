import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  sharedData: {
    auth: (ctx) => ctx.inertia.always(() => {
      try {
        const user = ctx.auth?.user
        return {
          user: user ? {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          } : null,
        }
      } catch {
        return { user: null }
      }
    }),
    flash: (ctx) => ctx.inertia.always(() => {
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
  },

  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx',
  }
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
