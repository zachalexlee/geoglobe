'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { haptic } from '@/lib/haptics'
import { playClick } from '@/lib/sounds'

const tabs = [
  { label: 'Play', href: '/play', icon: '🌍' },
  { label: 'Board', href: '/leaderboard', icon: '🏆' },
  { label: 'Groups', href: '/groups', icon: '👥' },
  { label: 'Versus', href: '/versus', icon: '⚔️' },
  { label: 'Profile', href: '/profile', icon: '👤' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/10 safe-area-pb"
      role="navigation"
      aria-label="Mobile bottom navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map(({ label, href, icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={() => {
              haptic('light')
              playClick()
            }}
            className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors ${
              active ? 'text-emerald-400' : 'text-gray-500 active:text-gray-300'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {/* Active indicator dot */}
            {active && (
              <motion.div
                className="absolute top-1 w-1 h-1 rounded-full bg-emerald-400"
                layoutId="nav-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <motion.span
              className="text-xl leading-none"
              animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.span>
            <span className="mt-0.5">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
