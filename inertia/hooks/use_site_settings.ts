import { usePage } from '@inertiajs/react'

/** Settings globais compartilhados via Inertia (config/inertia.ts) */
export function useSiteSettings(): Record<string, string | null> {
  const props = usePage().props as { siteSettings?: Record<string, string | null> }
  return props.siteSettings || {}
}

/** Valor de um setting com fallback (retorna fallback quando vazio/ausente) */
export function useSetting(key: string, fallback = ''): string {
  const settings = useSiteSettings()
  const value = settings[key]
  return value && value.trim() !== '' ? value : fallback
}
