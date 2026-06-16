import type { ReactNode } from 'react'
import { sectionShellProps, type SectionStyleConfig } from '~/lib/template-config'

/** Wrapper opcional de fundo por seção (configurado no modal do modelo). */
export function HomeSectionShell({
  style,
  children,
}: {
  style?: SectionStyleConfig
  children: ReactNode
}) {
  const props = sectionShellProps(style)
  if (!props.className && !props.style) return <>{children}</>
  return <div className={props.className} style={props.style}>{children}</div>
}
