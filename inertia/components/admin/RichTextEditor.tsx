import { useEffect, useState, type ComponentType } from 'react'
import type { RichTextEditorProps } from '~/components/admin/RichTextEditorClient'

function useIsDarkMode() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const sync = () => setDark(root.classList.contains('dark'))
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return dark
}

/**
 * Editor WYSIWYG (TinyMCE) — carrega só no browser (evita `window is not defined` no SSR).
 */
export default function RichTextEditor(props: RichTextEditorProps) {
  const [ClientEditor, setClientEditor] = useState<ComponentType<
    RichTextEditorProps & { isDark?: boolean }
  > | null>(null)
  const isDark = useIsDarkMode()

  useEffect(() => {
    import('~/components/admin/RichTextEditorClient').then((m) =>
      setClientEditor(() => m.default)
    )
  }, [])

  const minHeight = props.minHeight ?? 320

  if (!ClientEditor) {
    return (
      <div
        className="rounded-lg border border-border bg-muted/30 animate-pulse"
        style={{ minHeight }}
        aria-hidden
      />
    )
  }

  return <ClientEditor {...props} isDark={isDark} />
}
