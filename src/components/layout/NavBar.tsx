'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

const navLinks = [
  { label: 'Play', href: '/play' },
  { label: 'Time Attack', href: '/time-attack' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Groups', href: '/groups' },
  { label: 'Practice', href: '/practice' },
  { label: 'Versus', href: '/versus' },
]

export default function NavBar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      className="sticky top-0 z-50 h-14 bg-[#0a0a0a] border-b border-white/10 flex items-center px-4"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-white text-lg shrink-0 mr-6"
        onClick={() => setMenuOpen(false)}
      >
        <span className="text-2xl leading-none">🌍</span>
        <span className="tracking-tight">GeoGlobe</span>
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
        {navLinks.map(({ label, href }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Spacer on desktop so user section is right-aligned */}
      <div className="hidden md:block flex-1" />

      {/* User section */}
      <div className="flex items-center gap-3 ml-auto">
        {session?.user ? (
          <Link
            href="/profile"
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold text-xs uppercase select-none">
              {(session.user.name ?? session.user.email ?? '?')[0].toUpperCase()}
            </span>
            <span className="hidden md:inline max-w-[120px] truncate">
              {session.user.name ?? session.user.email}
            </span>
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
        )}

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            className={`block h-0.5 w-5 bg-white rounded transition-transform origin-center ${
              menuOpen ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white rounded transition-opacity ${
              menuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white rounded transition-transform origin-center ${
              menuOpen ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-[#0a0a0a] border-b border-white/10 flex flex-col py-2 md:hidden z-40">
          {navLinks.map(({ label, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
