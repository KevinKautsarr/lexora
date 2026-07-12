import Image from 'next/image'
import { Sparkles, Star } from 'lucide-react'

// ─── Mock data ───────────────────────────────────────────────────────
const MOCK_LESSONS = [
  { id: 'l1', title: 'Pengenalan', status: 'completed' as const, isFrontmost: false, isLastInUnit: false },
  { id: 'l2', title: 'Hobi & Minat', status: 'unlocked' as const, isFrontmost: true, isLastInUnit: false },
  { id: 'l3', title: 'Pekerjaan', status: 'locked' as const, isFrontmost: false, isLastInUnit: true },
]

// 3-cycle zigzag: center → right → left
const ZIGZAG_OFFSETS = [0, 48, -48] as const

function badgeFor(status: 'completed' | 'unlocked' | 'locked', isLastInUnit: boolean) {
  if (isLastInUnit && status === 'completed') return '/node-trophy.png'
  if (status === 'completed') return '/node-completed.png'
  if (status === 'unlocked') return '/node-active.png'
  return '/node-locked.png'
}

export default function MobilePathMock() {
  return (
    <div className="relative mx-auto w-full max-w-[280px] rounded-[40px] border-[10px] border-zinc-800 bg-zinc-950 p-4 shadow-2xl ring-4 ring-zinc-800/50">
      {/* Phone Notch */}
      <div className="absolute top-2 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-zinc-800 flex items-center justify-center">
        <div className="h-1 w-8 rounded-full bg-zinc-700" />
      </div>

      {/* Screen Header */}
      <div className="mb-3 mt-3 flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">
          UNIT 1
        </span>
        <div className="flex items-center gap-1 rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[9px] font-bold text-xp-400">
          <Star size={10} className="fill-xp-400 text-xp-400" />
          <span>160 XP</span>
        </div>
      </div>

      {/* Unit Banner — matches real UnitBanner */}
      <div className="relative mb-3 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-center shadow-sm">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #fff 0%, transparent 55%), radial-gradient(circle at 80% 50%, #fff 0%, transparent 55%)',
          }}
        />
        <div className="relative">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-100">Section 1</p>
          <h4 className="mt-0.5 text-sm font-extrabold text-white">Kehidupan Sehari-hari</h4>
        </div>
      </div>

      {/* Journey Nodes — zigzag with PNG badges */}
      <div className="flex flex-col items-center py-2">
        {MOCK_LESSONS.map((lesson, idx) => {
          const offset = ZIGZAG_OFFSETS[idx % ZIGZAG_OFFSETS.length]
          const badge = badgeFor(lesson.status, lesson.isLastInUnit)
          const isActive = lesson.isFrontmost && lesson.status === 'unlocked'

          return (
            <div key={lesson.id} className="flex flex-col items-center w-full">
              {/* Node */}
              <div
                className="flex flex-col items-center"
                style={{ transform: `translateX(${offset}px)` }}
              >
                <div className={`relative h-14 w-14 select-none ${isActive ? 'animate-node-bounce' : ''}`}>
                  <Image
                    src={badge}
                    alt={lesson.title}
                    width={56}
                    height={56}
                    className={`h-full w-full object-contain drop-shadow-sm ${
                      isActive
                        ? 'drop-shadow-[0_0_10px_color-mix(in_oklch,var(--color-brand-500)_55%,transparent)]'
                        : lesson.status === 'locked'
                        ? 'opacity-80'
                        : ''
                    }`}
                  />
                  {/* Active indicator badge */}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black animate-pulse">
                      !
                    </span>
                  )}
                </div>
                <span className={`mt-1 text-[9px] font-extrabold uppercase tracking-wider ${
                  isActive ? 'text-brand-400' : lesson.status === 'completed' ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {lesson.title}
                </span>
              </div>

              {/* Spacer between nodes (same gap style as real journey) */}
              {idx < MOCK_LESSONS.length - 1 && (
                <div className="h-7 w-full flex-shrink-0" aria-hidden />
              )}
            </div>
          )
        })}
      </div>

      {/* Floating Badge */}
      <div className="absolute bottom-6 -right-6 flex items-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-800 p-2 shadow-lg">
        <Sparkles size={14} className="text-xp-400" />
        <span className="text-[9px] font-extrabold text-zinc-200">Responsive UI</span>
      </div>
    </div>
  )
}
