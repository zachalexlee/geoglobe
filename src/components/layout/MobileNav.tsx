'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
      className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-[#0a0a0a] border-t border-white/10 h-16 safe-area-pb"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      {tabs.map(({ label, href, icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
              active ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
