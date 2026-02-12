import { usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export function FlashMessages() {
  const { flash } = usePage().props as any
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (flash?.success) {
      setMessage({ type: 'success', text: flash.success })
      setVisible(true)
    } else if (flash?.error) {
      setMessage({ type: 'error', text: flash.error })
      setVisible(true)
    }
  }, [flash])

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!visible || !message) return null

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${
      message.type === 'success'
        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {message.type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-emerald-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
      <span>{message.text}</span>
      <button onClick={() => setVisible(false)} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
