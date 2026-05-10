import Link from "next/link";

function TrophyIcon() {
  return (
    <svg
      className="w-8 h-8 text-emerald-400"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.75h3a.75.75 0 0 1 .75.75v2.25a3 3 0 0 1-3 3h-.257a5.25 5.25 0 0 1-4.993 4.243V17.25h2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-6.75a.75.75 0 0 1-.75-.75V18a.75.75 0 0 1 .75-.75H10v-3.257A5.25 5.25 0 0 1 5.007 9.75H4.75a3 3 0 0 1-3-3V4.5a.75.75 0 0 1 .75-.75h3M7.5 3.75v4.5a4.5 4.5 0 0 0 9 0v-4.5"
      />
    </svg>
  );
}

function SwordsIcon() {
  return (
    <svg
      className="w-8 h-8 text-emerald-400"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l7.07 7.07M3 3l3 1.5L7.5 7.5M3 3l1.5 3L7.5 7.5m0 0l-3 3L3 12l1.5-1.5M21 3l-7.07 7.07M21 3l-3 1.5-1.5 3m4.5-4.5-1.5 3-3 1.5m0 0 3 3L21 12l-1.5-1.5M10.07 13.93l-3.54 3.54a1.5 1.5 0 1 0 2.12 2.12l3.54-3.54M13.93 10.07l3.54 3.54a1.5 1.5 0 0 1 0 2.12l-.354.354a1.5 1.5 0 0 1-2.12 0l-3.54-3.54"
      />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      className="w-8 h-8 text-emerald-400"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75V15m0-8.25a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25ZM15 9.75V18m0-8.25a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25ZM9 15l6-6M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V17.625c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V6.375c0-1.036-.84-1.875-1.875-1.875H3.375Z"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      className="w-16 h-16 md:w-24 md:h-24 text-emerald-400"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.978 11.978 0 0 1 12 16.5a11.978 11.978 0 0 1-8.716-2.247m0 0A8.959 8.959 0 0 1 3 12c0-1.89.582-3.643 1.577-5.092"
      />
    </svg>
  );
}

const features = [
  {
    icon: <TrophyIcon />,
    title: "Daily Challenge",
    desc: "5 random cities every day. Pin them on the globe and score up to 500 points.",
    href: "/play",
  },
  {
    icon: <SwordsIcon />,
    title: "Versus Mode",
    desc: "Real-time head-to-head battles. Challenge friends or get matched with a stranger.",
    href: "/versus",
  },
  {
    icon: <MapIcon />,
    title: "Practice",
    desc: "Curated practice maps to sharpen your skills — from ancient capitals to modern cities.",
    href: "/practice",
  },
];

const stats = [
  { value: "50", label: "daily puzzles" },
  { value: "10", label: "practice maps" },
  { value: "10", label: "badges to earn" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-20 md:py-32">
        <div className="mb-6 select-none">
          <GlobeIcon />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4">
          GeoGlobe
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-md mb-10 leading-relaxed">
          A daily geography game —{" "}
          <span className="text-white/90">explore history, one pin at a time.</span>
        </p>
        <Link
          href="/play"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-900/40"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
          Play Today
        </Link>
      </section>

      {/* Feature cards */}
      <section className="px-4 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(({ icon, title, desc, href }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl bg-zinc-900/80 border border-white/10 p-6 flex flex-col gap-4 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                {icon}
              </div>
              <h2 className="text-white font-semibold text-lg group-hover:text-emerald-400 transition-colors">
                {title}
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats row */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="max-w-2xl mx-auto flex flex-row items-center justify-center gap-6 md:gap-12 flex-wrap">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-4xl md:text-5xl font-extrabold text-emerald-400">
                {value}
              </span>
              <span className="text-sm text-white/50 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
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
          </nav>
          <p>Built with ❤️ for geography lovers</p>
        </div>
      </footer>
    </div>
  );
}
