import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'

interface SharedProps {
  siteSettings?: Record<string, string | null>
}

export function DynamicFavicon() {
  const { siteSettings } = usePage<{ props: SharedProps }>().props as SharedProps

  useEffect(() => {
    const faviconUrl = siteSettings?.favicon_url
    if (!faviconUrl) return

    // Remove existing favicons
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]')
    existingFavicons.forEach(el => el.remove())

    // Add new favicon
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = faviconUrl
    document.head.appendChild(link)

    // Add apple-touch-icon
    const appleLink = document.createElement('link')
    appleLink.rel = 'apple-touch-icon'
    appleLink.href = faviconUrl
    document.head.appendChild(appleLink)
  }, [siteSettings?.favicon_url])

  return null
}
