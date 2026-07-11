'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Flame, X } from 'lucide-react'

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

/**
 * Banner pengingat belajar in-app. Server sudah memastikan syarat statis
 * (reminder aktif, streak > 0, belum belajar hari ini). Client hanya menambah
 * syarat waktu: sudah lewat jam pengingat (WIB). Bisa ditutup sekali per sesi.
 */
export default function ReminderBanner({
  reminderHour,
  streak,
}: {
  reminderHour: number
  streak: number
}) {
  // null saat SSR → hindari hydration mismatch; diisi setelah mount.
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const nowWib = new Date(Date.now() + WIB_OFFSET_MS)
    const currentHourWib = nowWib.getUTCHours()
    setVisible(currentHourWib >= reminderHour)
  }, [reminderHour])

  if (!visible || dismissed) return null

  return (
    <div
      role="status"
      className="relative flex items-center gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-4 py-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
        <Flame size={18} aria-hidden className="fill-orange-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-zinc-100">
          Jaga streak {streak} hari-mu!
        </p>
        <p className="text-xs text-zinc-400">
          Kamu belum belajar hari ini. Selesaikan satu lesson sebelum tengah malam.
        </p>
      </div>
      <Link
        href="/learn"
        className="shrink-0 rounded-xl border-b-2 border-orange-700 bg-orange-500 px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-orange-400"
      >
        Belajar
      </Link>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Tutup pengingat"
        className="shrink-0 rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 cursor-pointer"
      >
        <X size={16} aria-hidden />
      </button>
    </div>
  )
}
