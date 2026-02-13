import { usePage } from '@inertiajs/react'

type PageProps = {
  siteSettings?: Record<string, string | null>
  [key: string]: any
}

export function useSiteSettings() {
  const { props } = usePage<PageProps>()
  const s = props.siteSettings || {}

  const get = (key: string, fallback: string = '') => s[key] || fallback

  return { settings: s, get }
}
