'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// ── Page transition wrapper ───────────────────────────────────────────────────

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ── Staggered list animation ──────────────────────────────────────────────────

export function StaggerContainer({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// ── Fade in on scroll ─────────────────────────────────────────────────────────

export function FadeIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const directionMap = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// ── Scale pop (for buttons, badges, etc.) ─────────────────────────────────────

export function ScalePop({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

// ── Number counter animation ──────────────────────────────────────────────────

export function AnimatedNumber({
  value,
  className = '',
  duration = 1.5,
}: {
  value: number
  className?: string
  duration?: number
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <CountUp target={value} duration={duration} />
    </motion.span>
  )
}

function CountUp({ target, duration }: { target: number; duration: number }) {
  // Use framer motion's useMotionValue for smooth counting
  const { useMotionValue, useTransform, animate: motionAnimate, useMotionValueEvent } = require('framer-motion')
  const { useState, useEffect } = require('react')

  const [display, setDisplay] = useState(0)
  const count = useMotionValue(0)

  useMotionValueEvent(count, 'change', (latest: number) => {
    setDisplay(Math.round(latest))
  })

  useEffect(() => {
    const controls = motionAnimate(count, target, { duration })
    return () => controls.stop()
  }, [target, duration])

  return <>{display.toLocaleString()}</>
}

// ── Pulse/glow effect ─────────────────────────────────────────────────────────

export function PulseGlow({
  children,
  className = '',
  color = 'emerald',
}: {
  children: ReactNode
  className?: string
  color?: 'emerald' | 'amber' | 'indigo'
}) {
  const glowColors = {
    emerald: 'shadow-emerald-500/50',
    amber: 'shadow-amber-500/50',
    indigo: 'shadow-indigo-500/50',
  }

  return (
    <motion.div
      className={`${className} shadow-lg ${glowColors[color]}`}
      animate={{
        boxShadow: [
          `0 0 20px 0px var(--tw-shadow-color)`,
          `0 0 40px 10px var(--tw-shadow-color)`,
          `0 0 20px 0px var(--tw-shadow-color)`,
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

// ── Slide-up drawer animation ─────────────────────────────────────────────────

export function SlideUp({
  children,
  className = '',
  isVisible = true,
}: {
  children: ReactNode
  className?: string
  isVisible?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: '100%', opacity: 0 }}
      animate={isVisible ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {children}
    </motion.div>
  )
}
