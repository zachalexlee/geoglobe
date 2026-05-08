import Link from "next/link";

const features = [
  {
    icon: "🏆",
    title: "Daily Challenge",
    desc: "5 historical locations every day. Race against the world and climb the leaderboard.",
  },
  {
    icon: "⚔️",
    title: "Versus Mode",
    desc: "Real-time head-to-head battles. Challenge friends or get matched with a stranger.",
  },
  {
    icon: "📚",
    title: "Practice",
    desc: "50+ curated maps to sharpen your skills — from ancient capitals to modern cities.",
  },
];

const stats = [
  { value: "15", label: "puzzles created" },
  { value: "10", label: "practice maps" },
  { value: "10", label: "badges to earn" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4 py-20 md:py-32">
        <span className="text-7xl md:text-9xl leading-none mb-6 select-none drop-shadow-2xl">
          🌍
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4">
          GeoGlobe
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-md mb-10 leading-relaxed">
          A daily geography game —{" "}
          <span className="text-gray-300">explore history, one pin at a time.</span>
        </p>
        <Link
          href="/play"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-lg transition-all shadow-lg shadow-emerald-900/40"
        >
          <span>🌍</span> Play Today
        </Link>
      </section>

      {/* Feature cards */}
      <section className="px-4 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-3 hover:bg-white/8 transition-colors"
            >
              <span className="text-4xl leading-none">{icon}</span>
              <h2 className="text-white font-semibold text-lg">{title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
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
              <span className="text-sm text-gray-500 uppercase tracking-widest">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
