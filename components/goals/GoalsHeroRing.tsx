import DailyResetCountdown from '@/components/DailyResetCountdown'

// Ring progres keseluruhan goal harian — hero halaman Goals. Menampilkan
// "X/total goal selesai" secara melingkar. SVG murni (tanpa aset), memakai
// token tema agar ikut light/dark. Server component (statis).
export default function GoalsHeroRing({
  goalsDone,
  totalGoals,
  allDone,
}: {
  goalsDone: number
  totalGoals: number
  allDone: boolean
}) {
  const R = 52
  const C = 2 * Math.PI * R
  const pct = totalGoals > 0 ? goalsDone / totalGoals : 0
  const dash = C * pct

  return (
    <section
      className={`relative flex items-center gap-5 overflow-hidden rounded-3xl border p-5 sm:p-6 transition-colors ${
        allDone ? 'border-brand-400/60 bg-brand-100' : 'border-zinc-700 bg-zinc-800/50'
      }`}
      aria-label="Ringkasan progres goal harian"
    >
      {/* Ring */}
      <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
        <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
          {/* Track */}
          <circle
            cx="64" cy="64" r={R}
            fill="none"
            stroke="var(--color-zinc-700)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="64" cy="64" r={R}
            fill="none"
            stroke={allDone ? 'var(--color-brand-500)' : 'var(--color-brand-500)'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            className="transition-[stroke-dasharray] duration-700"
          />
        </svg>
        {/* Angka di tengah */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-extrabold leading-none tabular-nums text-zinc-100">
            {goalsDone}<span className="text-zinc-500">/{totalGoals}</span>
          </span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Goal
          </span>
        </div>
      </div>

      {/* Teks + countdown */}
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-zinc-100 sm:text-2xl">
          {allDone ? 'Semua goal tuntas! 🎉' : 'Goal hari ini'}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          {allDone
            ? 'Kerja bagus. Goal baru menunggu besok.'
            : `Tinggal ${totalGoals - goalsDone} goal lagi untuk mengklaim hadiah harian.`}
        </p>
        <div className="mt-3">
          <DailyResetCountdown />
        </div>
      </div>
    </section>
  )
}
