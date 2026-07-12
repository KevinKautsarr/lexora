'use client'

import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isSfxMuted, setSfxMuted, playSfx } from '@/lib/sfx'

// Saklar efek suara — preferensi per perangkat (localStorage), tanpa DB.
// State diinisialisasi di effect agar SSR & first paint konsisten (hindari
// hydration mismatch karena localStorage hanya ada di client).
export default function SoundToggle() {
  const [muted, setMuted] = useState(false)
  useEffect(() => {
    const rafId = requestAnimationFrame(() => setMuted(isSfxMuted()))
    return () => cancelAnimationFrame(rafId)
  }, [])

  function toggle() {
    const next = !muted
    setMuted(next)
    setSfxMuted(next)
    // Umpan balik langsung saat menyalakan — user dengar hasilnya seketika.
    if (!next) playSfx('correct')
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
          {muted ? <VolumeX size={18} aria-hidden /> : <Volume2 size={18} aria-hidden />}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-100">Efek Suara</p>
          <p className="text-[11px] text-zinc-500">
            Nada saat jawaban benar, salah, menang, dan hadiah.
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={!muted}
        aria-label="Aktifkan efek suara"
        onClick={toggle}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 cursor-pointer ${
          muted
            ? 'border-zinc-600 bg-zinc-700/60'
            : 'border-brand-500/50 bg-brand-500'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow transition-[left] duration-200 ${
            muted ? 'left-0.5' : 'left-[calc(100%-1.5rem)]'
          }`}
          style={{ height: 22, width: 22 }}
        />
      </button>
    </div>
  )
}
