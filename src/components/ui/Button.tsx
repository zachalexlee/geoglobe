'use client'

import { motion } from 'framer-motion'
import { haptic } from '@/lib/haptics'
import { playClick } from '@/lib/sounds'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-900/30 hover:shadow-emerald-500/20',
  secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
  ghost: 'bg-transparent hover:bg-white/5 text-white/70 hover:text-white',
  danger: 'bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-900/30',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-8 py-4 text-base rounded-2xl gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  fullWidth = false,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (disabled || loading) return
    haptic('light')
    playClick()
    onClick?.(e)
  }

  return (
    <motion.button
      className={`inline-flex items-center justify-center font-semibold transition-all ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <motion.span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
