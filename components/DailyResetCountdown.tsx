'use client'

import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

// Hitung mundur ke reset goal harian = tengah malam WIB berikutnya
// (konsisten dengan wibDateOnly di lib/streak — hari dihitung berbasis UTC+7).
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

function msUntilNextWibMidnight(now: Date): number {
  // Kerjakan dalam "waktu WIB" dengan menggeser +7 jam, hitung midnight
  // berikutnya di ruang itu, lalu geser balik ke epoch nyata.
  const wibNow = new Date(now.getTime() + WIB_OFFSET_MS)
  const nextWibMidnight = Date.UTC(
    wibNow.getUTCFullYear(),
    wibNow.getUTCMonth(),
    wibNow.getUTCDate() + 1,
  )
  return nextWibMidnight - wibNow.getTime()
}

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function DailyResetCountdown() {
  // null saat SSR/render pertama → hindari hydration mismatch (waktu client
  // berbeda dari server). Diisi setelah mount.
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setRemaining(msUntilNextWibMidnight(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-300 bg-brand-100 px-3 py-1.5 text-sm font-bold text-brand-700 tabular-nums"
      aria-live="off"
    >
      <Clock size={15} aria-hidden />
      <span className="text-xs font-semibold text-zinc-400">Reset dalam</span>
      {remaining === null ? '—:—:—' : format(remaining)}
    </span>
  )
}
