'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Onboarding from '@/components/onboarding/Onboarding'
import { resumeAudio } from '@/lib/sounds'

// ── Icons ─────────────────────────────────────────────────────────────────────

function TrophyIcon() {
  return (
    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75h3a.75.75 0 0 1 .75.75v2.25a3 3 0 0 1-3 3h-.257a5.25 5.25 0 0 1-4.993 4.243V17.25h2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-6.75a.75.75 0 0 1-.75-.75V18a.75.75 0 0 1 .75-.75H10v-3.257A5.25 5.25 0 0 1 5.007 9.75H4.75a3 3 0 0 1-3-3V4.5a.75.75 0 0 1 .75-.75h3M7.5 3.75v4.5a4.5 4.5 0 0 0 9 0v-4.5" />
    </svg>
  )
}

function SwordsIcon() {
  return (
    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l7.07 7.07M3 3l3 1.5L7.5 7.5M3 3l1.5 3L7.5 7.5m0 0l-3 3L3 12l1.5-1.5M21 3l-7.07 7.07M21 3l-3 1.5-1.5 3m4.5-4.5-1.5 3-3 1.5m0 0 3 3L21 12l-1.5-1.5M10.07 13.93l-3.54 3.54a1.5 1.5 0 1 0 2.12 2.12l3.54-3.54M13.93 10.07l3.54 3.54a1.5 1.5 0 0 1 0 2.12l-.354.354a1.5 1.5 0 0 1-2.12 0l-3.54-3.54" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0-8.25a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25ZM15 9.75V18m0-8.25a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25ZM9 15l6-6M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V17.625c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V6.375c0-1.036-.84-1.875-1.875-1.875H3.375Z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

// ── Feature data ──────────────────────────────────────────────────────────────

const features = [
  {
    icon: <TrophyIcon />,
    title: 'Daily Challenge',
    desc: '5 random cities every day. Pin them on the globe and score up to 500 points.',
    href: '/play',
    color: 'from-emerald-500/20 to-transparent',
  },
  {
    icon: <SwordsIcon />,
    title: 'Versus Mode',
    desc: 'Real-time head-to-head battles. Challenge friends or match with a stranger.',
    href: '/versus',
    color: 'from-indigo-500/20 to-transparent',
  },
  {
    icon: <MapIcon />,
    title: 'Practice',
    desc: 'Curated maps to sharpen your skills — from ancient capitals to modern megacities.',
    href: '/practice',
    color: 'from-amber-500/20 to-transparent',
  },
  {
    icon: <ClockIcon />,
    title: 'Time Attack',
    desc: 'Race against the clock. How many cities can you nail in 60 seconds?',
    href: '/time-attack',
    color: 'from-rose-500/20 to-transparent',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomeClient() {
  const { data: session } = useSession()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Show onboarding for first-time visitors
    const hasSeenOnboarding = localStorage.getItem('geoglobe-onboarding-v1')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  function handleOnboardingComplete() {
    localStorage.setItem('geoglobe-onboarding-v1', 'true')
    setShowOnboarding(false)
  }

  function handleInteraction() {
    if (!hasInteracted) {
      resumeAudio()
      setHasInteracted(true)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]" onClick={handleInteraction}>
      {/* Onboarding overlay */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-16 md:py-28 relative overflow-hidden">
        {/* Subtle radial gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-emerald-950/30 via-transparent to-transparent pointer-events-none" />

        {/* Animated globe icon */}
        <motion.div
          className="mb-6 select-none relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.1 }}
        >
          <motion.span
            className="text-7xl md:text-8xl block"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            🌍
          </motion.span>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl scale-150 -z-10" />
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          GeoGlobe
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/70 max-w-md mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          A daily geography game —{' '}
          <span className="text-white/90">explore the world, one pin at a time.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            href="/play"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-900/40 hover:shadow-emerald-500/30 hover:shadow-xl"
          >
            <motion.svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </motion.svg>
            {session ? 'Play Today' : 'Start Playing'}
          </Link>
        </motion.div>

        {/* Quick stats for logged-in users */}
        {session && (
          <motion.div
            className="mt-8 flex items-center gap-4 text-sm text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span>Welcome back, <span className="text-emerald-400">{session.user?.name || 'explorer'}</span></span>
          </motion.div>
        )}
      </section>

      {/* Feature cards */}
      <section className="px-4 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon, title, desc, href, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
            >
              <Link
                href={href}
                className="group relative rounded-2xl bg-zinc-900/80 border border-white/10 p-5 flex flex-col gap-3 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all duration-200 overflow-hidden h-full"
              >
                {/* Gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${color} pointer-events-none`} />

                <div className="relative w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <h2 className="relative text-white font-semibold text-base group-hover:text-emerald-400 transition-colors">
                  {title}
                </h2>
                <p className="relative text-white/50 text-sm leading-relaxed">{desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof / how it works */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <h2 className="text-white text-2xl font-bold mb-2">How It Works</h2>
            <p className="text-white/50 text-sm">Three steps to geography mastery</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'See a City', desc: "We show you a city name and country. That's your only clue." },
              { step: '2', title: 'Drop Your Pin', desc: 'Spin the globe and tap where you think it is.' },
              { step: '3', title: 'Score & Learn', desc: 'See how close you were + fun facts about the city.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.15 }}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-emerald-400 font-bold text-sm">{item.step}</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>© 2026 GeoGlobe</p>
          <nav className="flex items-center gap-6">
            <Link href="/leaderboard" className="hover:text-emerald-400 transition-colors">
              Leaderboard
            </Link>
            <Link href="/practice" className="hover:text-emerald-400 transition-colors">
              Practice
            </Link>
            <Link href="/tournaments" className="hover:text-emerald-400 transition-colors">
              Tournaments
            </Link>
          </nav>
          <p>Built with ❤️ for geography lovers</p>
        </div>
      </footer>
    </div>
  )
}
