'use client'

import { Flame, Trophy, Award } from 'lucide-react'

// ─── Static mock data ───────────────────────────────────────────────
// Simulasi: 14 hari aktif berturut-turut di bulan Juli 2025,
// dimulai tanggal 1 sampai 14.
const MOCK_ACTIVE_DATES = new Set([
  '2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04',
  '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08',
  '2025-07-09', '2025-07-10', '2025-07-11', '2025-07-12',
  '2025-07-13', '2025-07-14',
])
const MOCK_YEAR = 2025
const MOCK_MONTH = 6 // Juli (0-indexed)
const MOCK_FREEZES = 2
const MAX_FREEZES = 3

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const FreezeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-sky-400" aria-hidden="true">
    <path d="M12 2C12 2 6 8.5 6 13C6 16.3 8.7 19 12 19C15.3 19 18 16.3 18 13C18 8.5 12 2 12 2Z" />
  </svg>
)

// ─── Build calendar grid ─────────────────────────────────────────────
function buildCalendarWeeks() {
  const totalDays = new Date(Date.UTC(MOCK_YEAR, MOCK_MONTH + 1, 0)).getUTCDate()
  const startDayOfWeek = new Date(Date.UTC(MOCK_YEAR, MOCK_MONTH, 1)).getUTCDay()
  const gridStart = new Date(Date.UTC(MOCK_YEAR, MOCK_MONTH, 1 - startDayOfWeek))

  const cells = Array.from({ length: 42 }, (_, i) => {
    const cellDate = new Date(gridStart.getTime() + i * 86_400_000)
    const y = cellDate.getUTCFullYear()
    const m = cellDate.getUTCMonth()
    const d = cellDate.getUTCDate()
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isCurrentMonth = m === MOCK_MONTH
    const isActive = MOCK_ACTIVE_DATES.has(dateStr)

    let displayLabel = ''
    let cellActive = isActive

    if (isCurrentMonth) {
      displayLabel = String(d)
    } else {
      const isPrev = cellDate.getTime() < Date.UTC(MOCK_YEAR, MOCK_MONTH, 1)
      if (isPrev && isActive) {
        displayLabel = '✦'
      } else {
        cellActive = false
      }
    }

    return { dateStr, isActive: cellActive, isPadding: !isCurrentMonth, displayLabel }
  })

  const allWeeks: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) allWeeks.push(cells.slice(i, i + 7))

  // Drop empty trailing rows
  return allWeeks.filter((week, idx) =>
    idx < 4 || week.some((c) => c.displayLabel !== '' && !c.isPadding),
  )
}

function getActiveSegments(week: ReturnType<typeof buildCalendarWeeks>[number]) {
  const segments: { start: number; length: number }[] = []
  let start = -1
  for (let i = 0; i < week.length; i++) {
    if (week[i].isActive && week[i].displayLabel !== '') {
      if (start === -1) start = i
    } else {
      if (start !== -1) { segments.push({ start, length: i - start }); start = -1 }
    }
  }
  if (start !== -1) segments.push({ start, length: week.length - start })
  return segments
}

const weeks = buildCalendarWeeks()

// ─── Component ───────────────────────────────────────────────────────
export default function StreakCalendarMock() {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-zinc-700/60 bg-zinc-800/80 p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
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

      {/* Streak Freeze indicator */}
      <div className="mb-4">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/40 p-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
            <FreezeIcon />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <p className="text-base font-black text-zinc-100 leading-none tabular-nums">
                {MOCK_FREEZES}<span className="text-zinc-500">/{MAX_FREEZES}</span>
              </p>
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: MAX_FREEZES }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${i < MOCK_FREEZES ? 'bg-sky-500' : 'bg-zinc-700'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">
              Streak Freeze
            </p>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-4 shadow-inner mb-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-zinc-600 mb-2">
          {WEEKDAYS.map((d) => <div key={d} className="py-0.5">{d}</div>)}
        </div>

        {/* Week rows */}
        <div className="flex flex-col gap-2">
          {weeks.map((week, wIdx) => {
            const segments = getActiveSegments(week)
            return (
              <div key={wIdx} className="relative grid grid-cols-7 gap-x-0.5 h-9 items-center">
                {/* Capsule / circle highlights */}
                {segments.map((seg, sIdx) => {
                  const leftPct = (seg.start / 7) * 100
                  const widthPct = (seg.length / 7) * 100
                  const isCapsule = seg.length > 1
                  return (
                    <div
                      key={sIdx}
                      className={`absolute top-1/2 h-8 -translate-y-1/2 rounded-full z-0 ${
                        isCapsule
                          ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 shadow-lg shadow-orange-600/15'
                          : 'bg-orange-500 shadow-md shadow-orange-600/20'
                      }`}
                      style={{
                        left: isCapsule
                          ? `calc(${leftPct}% + 3px)`
                          : `calc(${leftPct}% + ${100 / 7 / 2}% - 16px)`,
                        width: isCapsule ? `calc(${widthPct}% - 6px)` : '32px',
                      }}
                      aria-hidden="true"
                    />
                  )
                })}
                {/* Date labels */}
                {week.map((cell, cIdx) => {
                  if (cell.displayLabel === '') return <div key={cIdx} className="aspect-square" />
                  return (
                    <div key={cIdx} className="relative z-10 flex items-center justify-center aspect-square select-none">
                      <span className={`text-xs font-black tabular-nums ${
                        cell.isActive ? 'text-zinc-950 scale-105' : 'text-zinc-600'
                      }`}>
                        {cell.displayLabel}
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-700/40 bg-zinc-900/30 p-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-xp-400/10 text-xp-400">
            <Trophy size={14} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Level Aktif</p>
            <p className="text-xs font-black text-zinc-200">Tingkat 1</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-700/40 bg-zinc-900/30 p-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
            <Award size={14} />
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
