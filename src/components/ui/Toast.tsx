'use client'

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'achievement'

interface Toast {
  id: string
  type: ToastType
  message: string
  emoji?: string
  duration?: number
}

interface ToastContextType {
  toast: (opts: Omit<Toast, 'id'>) => void
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const toast: Toast = { id, duration: 3000, ...opts }
    setToasts((prev) => [...prev, toast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-16 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// ── Toast item ────────────────────────────────────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
  const bgColors: Record<ToastType, string> = {
    success: 'bg-emerald-500/90 border-emerald-400/30',
    error: 'bg-red-500/90 border-red-400/30',
    info: 'bg-indigo-500/90 border-indigo-400/30',
    achievement: 'bg-amber-500/90 border-amber-400/30',
  }

  const defaultEmojis: Record<ToastType, string> = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    achievement: '🏆',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`pointer-events-auto px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg flex items-center gap-2 max-w-sm ${bgColors[toast.type]}`}
    >
      <span className="text-lg">{toast.emoji || defaultEmojis[toast.type]}</span>
      <span className="text-white text-sm font-medium">{toast.message}</span>
    </motion.div>
  )
}
