import Image from 'next/image'
import { Flame, BookOpen, Zap, Gem, Trophy } from 'lucide-react'

// Preview widget "Sistem Pencapaian" — pakai medal PNG asli (sama seperti di
// halaman profil sungguhan), jadi mewakili fitur yang benar-benar live, bukan
// mock janji "Segera Hadir".
const CATEGORIES = [
  { medal: '/assets/medal-flame.png', icon: Flame, label: 'Streak', earned: 5, total: 7 },
  { medal: '/assets/medal-book.png', icon: BookOpen, label: 'Lesson', earned: 4, total: 7 },
  { medal: '/assets/medal-lightning.png', icon: Zap, label: 'XP', earned: 3, total: 7 },
  { medal: '/assets/medal-diamond.png', icon: Gem, label: 'Gems', earned: 2, total: 6 },
  { medal: '/assets/medal-laurel.png', icon: Trophy, label: 'Liga', earned: 1, total: 4 },
]

export default function AchievementMock({ totalBadges }: { totalBadges: number }) {
  const totalEarned = CATEGORIES.reduce((s, c) => s + c.earned, 0)

  return (
    <div className="relative mx-auto w-full max-w-[340px] rounded-3xl border border-zinc-700/60 bg-zinc-900/80 p-6 shadow-2xl shadow-brand-900/10 ring-1 ring-zinc-800">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-zinc-100 tracking-tight">Pencapaian</h3>
          <p className="text-[10px] font-bold text-zinc-500">Progres belajarmu, terekam otomatis</p>
        </div>
        <span className="rounded-full bg-brand-500/15 border border-brand-500/30 px-2.5 py-1 text-[10px] font-black text-brand-400 tabular-nums">
          {totalEarned}/{totalBadges}
        </span>
      </div>

      {/* Category rows */}
      <div className="flex flex-col gap-2.5">
        {CATEGORIES.map((c) => {
          const pct = Math.round((c.earned / c.total) * 100)
          return (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-2xl border border-zinc-700/50 bg-zinc-800/50 px-3 py-2.5"
            >
              <div className="relative h-9 w-9 shrink-0">
                <Image src={c.medal} alt="" fill sizes="36px" className="object-contain drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-zinc-200">{c.label}</span>
                  <span className="text-[10px] font-bold tabular-nums text-zinc-500">
                    {c.earned}/{c.total}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-700/60">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating count badge */}
      <div className="absolute -top-3 -right-3 flex items-center gap-1 rounded-xl bg-brand-600 px-2.5 py-1 shadow-md shadow-brand-900/20">
        <span className="text-[9px] font-black text-white uppercase tracking-wider">{totalBadges} Badge</span>
      </div>
    </div>
  )
}
