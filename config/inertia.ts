import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',

  sharedData: {
    auth: (ctx) => ctx.inertia.always(() => {
      try {
        return {
          user: ctx.auth?.user ? {
            id: ctx.auth.user.id,
            fullName: ctx.auth.user.fullName,
            email: ctx.auth.user.email,
            role: ctx.auth.user.role,
          } : null,
        }
      } catch {
        return { user: null }
      }
    }),
    flash: (ctx) => ctx.inertia.always(() => {
      try {
        return {
          success: ctx.session?.flashMessages?.get('success') ?? null,
          error: ctx.session?.flashMessages?.get('error') ?? null,
        }
      } catch {
        return { success: null, error: null }
      }
    }),
  },

  ssr: {
    enabled: true,
    entrypoint: 'inertia/app/ssr.tsx'
  }
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
