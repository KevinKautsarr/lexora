'use client'

import { useActionState, useState } from 'react'
import { updateReminder, type ReminderState } from './actions'

// Jam pengingat 00:00–23:00 (WIB).
const HOURS = Array.from({ length: 24 }, (_, h) => h)

export default function ReminderForm({
  enabled: initialEnabled,
  hour: initialHour,
}: {
  enabled: boolean
  hour: number
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [hour, setHour] = useState(initialHour)
  const [state, formAction, pending] = useActionState<ReminderState, FormData>(
    updateReminder,
    null,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Toggle aktif/nonaktif */}
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span className="text-sm font-bold text-zinc-200">Aktifkan pengingat harian</span>
        {/* Hidden input membawa nilai ke form action; switch memodifikasi state. */}
        <input type="checkbox" name="enabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="peer sr-only" />
        <span
          aria-hidden
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            enabled ? 'bg-brand-500' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </span>
      </label>

      {/* Pilih jam — tampil hanya saat aktif */}
      <label className={`flex flex-col gap-1 text-xs font-bold text-zinc-400 transition-opacity ${enabled ? 'opacity-100' : 'pointer-events-none opacity-40'}`}>
        Ingatkan sekitar jam
        <select
          name="hour"
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          disabled={!enabled}
          className="w-max rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-brand-500 disabled:opacity-50"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}:00 WIB
            </option>
          ))}
        </select>
      </label>

      <p className="text-[11px] leading-relaxed text-zinc-500">
        Pengingat muncul di dalam aplikasi saat kamu membuka Lexora setelah jam ini, kalau
        streak-mu belum aman hari itu.
      </p>

      {state && (
        <p
          role="status"
          className={`rounded-lg px-3 py-2 text-sm ${
            state.ok ? 'bg-brand-100 text-brand-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xl bg-brand-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50 cursor-pointer"
      >
        {pending ? 'Menyimpan…' : 'Simpan Pengingat'}
      </button>
    </form>
  )
}
