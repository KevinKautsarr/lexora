import { Flame, Trophy, Award } from 'lucide-react'

export default function StreakCalendarMock() {
  const days = [
    { num: 1, active: true },
    { num: 2, active: true },
    { num: 3, active: true },
    { num: 4, active: true },
    { num: 5, active: true },
    { num: 6, active: true },
    { num: 7, active: true },
    { num: 8, active: true },
    { num: 9, active: true },
    { num: 10, active: true },
    { num: 11, active: true },
    { num: 12, active: true },
    { num: 13, active: true },
    { num: 14, active: true },
    { num: 15, active: false },
    { num: 16, active: false },
    { num: 17, active: false },
    { num: 18, active: false },
    { num: 19, active: false },
    { num: 20, active: false },
    { num: 21, active: false },
  ]

  return (
    <div className="w-full max-w-sm rounded-3xl border border-zinc-700/60 bg-zinc-800/80 p-5 shadow-xl backdrop-blur-md">
      {/* Widget Header */}
      <div className="mb-4 flex items-center justify-between border-b border-zinc-700/50 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={20} />
          <div>
            <h4 className="text-sm font-black text-zinc-100">14 Hari Streak!</h4>
            <p className="text-[10px] text-zinc-400">Target Harian Tercapai</p>
          </div>
        </div>
        <div className="rounded-lg bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold text-orange-500">
          Super Konsisten
        </div>
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 gap-2.5 mb-4">
        {days.map((day) => (
          <div
            key={day.num}
            className={`flex aspect-square flex-col items-center justify-center rounded-xl text-xs font-bold transition-all
              ${
                day.active
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/20'
                  : 'bg-zinc-900/40 text-zinc-500 border border-zinc-700/40'
              }
            `}
          >
            {day.active ? (
              <Flame className="h-4.5 w-4.5 fill-white text-white" />
            ) : (
              <span>{day.num}</span>
            )}
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3.5 pt-1">
        <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-700/40 bg-zinc-900/30 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-xp-400/10 text-xp-400">
            <Trophy size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Level Aktif</p>
            <p className="text-xs font-black text-zinc-200">Tingkat 1</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-700/40 bg-zinc-900/30 p-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <Award size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Akurasi</p>
            <p className="text-xs font-black text-zinc-200">96.8%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
