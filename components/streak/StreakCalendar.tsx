'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MAX_FREEZES = 3

type StreakCalendarProps = {
  completedDates: string[] // Format: YYYY-MM-DD (WIB)
  streakFreezes: number // Jumlah freeze dimiliki (0..MAX_FREEZES)
}

type CalendarCell = {
  dayNum: number | null
  dateStr: string
  isActive: boolean
  isPadding: boolean
  displayLabel: string
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const FreezeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-sky-400 text-sky-400" aria-hidden="true">
    <path d="M12 2C12 2 6 8.5 6 13C6 16.3 8.7 19 12 19C15.3 19 18 16.3 18 13C18 8.5 12 2 12 2Z" />
  </svg>
)

export default function StreakCalendar({ completedDates, streakFreezes }: StreakCalendarProps) {
  const freezes = Math.max(0, Math.min(MAX_FREEZES, streakFreezes))
  // Bulan/tahun awal mengikuti tanggal WIB (bukan UTC), agar bulan yang tampil
  // sama dengan hari lokal user — konsisten dengan batas hari streak di WIB.
  const now = new Date(new Date().getTime() + 7 * 60 * 60 * 1000) // WIB (UTC+7)
  const [year, setYear] = useState(now.getUTCFullYear())
  const [month, setMonth] = useState(now.getUTCMonth()) // 0-indexed

  // Ambil total hari di bulan ini
  const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

  // Hari pertama di bulan ini jatuh di hari apa (0 = Minggu, 1 = Senin, dst)
  const startDayOfWeek = new Date(Date.UTC(year, month, 1)).getUTCDay()

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  // Cari tanggal awal grid kalender (minggu pertama hari Minggu)
  const gridStartDate = new Date(Date.UTC(year, month, 1 - startDayOfWeek))

  // Isi grid sel kalender
  const gridCells: CalendarCell[] = []
  const totalCellsCount = 42 // 6 minggu

  for (let i = 0; i < totalCellsCount; i++) {
    const cellDate = new Date(gridStartDate.getTime() + i * 86_400_000)
    const y = cellDate.getUTCFullYear()
    const m = cellDate.getUTCMonth()
    const d = cellDate.getUTCDate()
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isActive = completedDates.includes(dateStr)
    const isCurrentMonth = m === month

    let displayLabel = ''
    let cellActive = isActive

    if (isCurrentMonth) {
      displayLabel = String(d)
    } else {
      // Hanya biarkan hari aktif dari bulan SEBELUMNYA tampil sebagai ✦
      const isPreviousMonth = cellDate.getTime() < Date.UTC(year, month, 1)
      if (isPreviousMonth && isActive) {
        displayLabel = '✦'
      } else {
        cellActive = false // Paksa non-aktif untuk hari dari bulan berikutnya
      }
    }

    gridCells.push({
      dayNum: isCurrentMonth ? d : null,
      dateStr,
      isActive: cellActive,
      isPadding: !isCurrentMonth,
      displayLabel,
    })
  }

  // Pecah sel menjadi baris (minggu) isi 7 hari
  const weeks: CalendarCell[][] = []
  for (let i = 0; i < gridCells.length; i += 7) {
    weeks.push(gridCells.slice(i, i + 7))
  }

  // Filter baris kosong di akhir grid
  const activeWeeks = weeks.filter((week, index) => {
    if (index < 4) return true
    return week.some((cell) => cell.dayNum !== null || cell.isActive)
  })

  // Algoritma segmen hari aktif berturut-turut dalam satu baris (minggu)
  const getActiveSegments = (week: CalendarCell[]) => {
    const segments: { start: number; length: number }[] = []
    let start = -1
    for (let i = 0; i < week.length; i++) {
      if (week[i].isActive && week[i].displayLabel !== '') {
        if (start === -1) {
          start = i
        }
      } else {
        if (start !== -1) {
          segments.push({ start, length: i - start })
          start = -1
        }
      }
    }
    if (start !== -1) {
      segments.push({ start, length: week.length - start })
    }
    return segments
  }

  return (
    <div className="w-full">
      {/* Bulan & Navigasi */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-zinc-100">
          {MONTH_NAMES[month]} {year}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/40 text-zinc-400 transition-[background-color,color,transform] duration-200 hover:bg-zinc-800 hover:text-zinc-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            onClick={handleNextMonth}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/40 text-zinc-400 transition-[background-color,color,transform] duration-200 hover:bg-zinc-800 hover:text-zinc-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Streak Freeze — kepemilikan X/3. Freeze auto-pakai menambal streak
          saat bolong; didapat langka dari peti goal harian. */}
      <div className="mb-6">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900/40 p-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
            <FreezeIcon />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <p className="text-lg font-black text-zinc-100 leading-none tabular-nums">
                {freezes}
                <span className="text-zinc-500">/{MAX_FREEZES}</span>
              </p>
              {/* Pip indicator — jangan andalkan warna saja (SKILL: color-not-only);
                  teks X/3 di atas sudah menyampaikan nilai, pip memperkuat visual. */}
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: MAX_FREEZES }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i < freezes ? 'bg-sky-500' : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
              Streak Freeze
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-3xl border border-zinc-700 bg-zinc-900/40 p-5 shadow-inner">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-zinc-600 mb-3">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Weeks Grid */}
        <div className="flex flex-col gap-3">
          {activeWeeks.map((week, wIndex) => {
            const segments = getActiveSegments(week)

            return (
              <div key={`week-${wIndex}`} className="relative grid grid-cols-7 gap-x-0.5 h-11 items-center">
                {/* Highlight hari aktif — kapsul (≥2 hari beruntun) atau lingkaran
                    (1 hari). Keduanya memakai sistem posisi persen yang SAMA
                    (start/7 & length/7) agar sejajar tepat dengan angka tanggal
                    di grid 7-kolom dan tetap presisi di semua lebar (responsif). */}
                {segments.map((seg, sIndex) => {
                  const leftPercent = (seg.start / 7) * 100
                  const widthPercent = (seg.length / 7) * 100
                  const isCapsule = seg.length > 1
                  return (
                    <div
                      key={`seg-${sIndex}`}
                      className={`absolute top-1/2 h-10 -translate-y-1/2 rounded-full z-0 ${
                        isCapsule
                          ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 shadow-lg shadow-orange-600/15'
                          : 'bg-orange-500 shadow-md shadow-orange-600/20'
                      }`}
                      style={{
                        // Kolom selebar (100/7)% ; inset 4px kiri-kanan untuk kapsul,
                        // dan untuk lingkaran tunggal dibuat lebar = tinggi (h-10 = 40px)
                        // dengan menengahkan di dalam kolomnya.
                        left: isCapsule
                          ? `calc(${leftPercent}% + 4px)`
                          : `calc(${leftPercent}% + ${100 / 7 / 2}% - 20px)`,
                        width: isCapsule ? `calc(${widthPercent}% - 8px)` : '40px',
                      }}
                      aria-hidden="true"
                    />
                  )
                })}

                {/* Render Teks Tanggal / Ikon */}
                {week.map((cell, cIndex) => {
                  if (cell.displayLabel === '') {
                    return <div key={`cell-${cIndex}`} className="aspect-square" />
                  }

                  return (
                    <div
                      key={`cell-${cIndex}`}
                      className="relative z-10 flex items-center justify-center aspect-square select-none"
                    >
                      <span
                        className={`text-sm font-black tabular-nums transition-[transform,color] duration-300
                          ${
                            cell.isActive
                              ? 'text-zinc-950 scale-105'
                              : 'text-zinc-600 hover:text-zinc-400'
                          }
                        `}
                      >
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
    </div>
  )
}
