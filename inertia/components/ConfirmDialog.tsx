import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return context.confirm
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const cancelBtnRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    lastFocused.current = document.activeElement as HTMLElement
    setOptions(opts)
    setIsOpen(true)
    return new Promise((resolve) => {
      setResolver(() => resolve)
    })
  }

  const close = (value: boolean) => {
    setIsOpen(false)
    resolver?.(value)
    // Devolve o foco ao elemento que abriu o diálogo (a11y)
    lastFocused.current?.focus?.()
  }

  // Foco inicial + armadilha de foco + Esc
  useEffect(() => {
    if (!isOpen) return
    cancelBtnRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close(false)
      }
      if (e.key === 'Tab') {
        // Apenas dois botões focáveis: cicla entre eles
        const a = cancelBtnRef.current
        const b = confirmBtnRef.current
        if (!a || !b) return
        const active = document.activeElement
        if (e.shiftKey && active === a) {
          e.preventDefault()
          b.focus()
        } else if (!e.shiftKey && active === b) {
          e.preventDefault()
          a.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const variantStyles = {
    danger: {
      icon: 'bg-destructive/15 text-destructive',
      button: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
    },
    warning: {
      icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      button: 'bg-amber-500 hover:bg-amber-600 text-navy-dark',
    },
    info: {
      icon: 'bg-primary/15 text-primary',
      button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
  }

  const variant = options?.variant || 'danger'
  const styles = variantStyles[variant]

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-message"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => close(false)}
          />

          {/* Dialog */}
          <div className="relative bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div
                className={`w-12 h-12 rounded-full ${styles.icon} flex items-center justify-center mx-auto mb-4`}
              >
                <AlertTriangle className="w-6 h-6" aria-hidden="true" />
              </div>

              <h3 id="confirm-title" className="text-lg font-semibold text-foreground text-center mb-2">
                {options?.title || 'Confirmar ação'}
              </h3>
              <p id="confirm-message" className="text-muted-foreground text-center text-sm">
                {options?.message}
              </p>
            </div>

            <div className="flex gap-3 p-4 bg-muted/40 rounded-b-xl border-t border-border">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={() => close(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                {options?.cancelText || 'Cancelar'}
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={() => close(true)}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${styles.button}`}
              >
                {options?.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
