'use client'

import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'

// Tombol melayang dinamis berdasarkan posisi scroll terhadap pelajaran aktif (#active-lesson).
//
// Posisi:
// - Mobile: fixed di kanan bawah (right-4, bottom-20) → di atas BottomNav.
// - Desktop (lg+): fixed, right dihitung agar tombol menempel di sisi kanan kolom
//   tengah (Journey Path). Sidebar kiri = 224px (lg:pl-56 = 14rem), sidebar
//   kanan = 288px (w-72) + gap 32px (lg:gap-8). Jadi right ~= 320px dari tepi kanan.
//
// Logika scroll:
// - Klik selalu men-scroll halaman ke elemen #active-lesson (pelajaran terakhir user).
// - Arah panah (up/down) menyesuaikan posisi relatif target terhadap viewport.
// - Tersembunyi ketika target sudah terlihat di layar.
export default function ScrollToggleButton() {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    const checkPosition = () => {
      const target = document.getElementById('active-lesson')
      if (!target) {
        setDirection(null)
        return
      }

      const rect = target.getBoundingClientRect()
      const threshold = 150

      if (rect.bottom < -threshold) {
        setDirection('up')
      } else if (rect.top > window.innerHeight + threshold) {
        setDirection('down')
      } else {
        setDirection(null)
      }
    }

    window.addEventListener('scroll', checkPosition, { passive: true })
    window.addEventListener('resize', checkPosition, { passive: true })

    // Run on mount after DOM settles
    const timer = setTimeout(checkPosition, 400)

    return () => {
      window.removeEventListener('scroll', checkPosition)
      window.removeEventListener('resize', checkPosition)
      clearTimeout(timer)
    }
  }, [])

  const scrollToActive = () => {
    const target = document.getElementById('active-lesson')
    if (!target) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Hitung posisi manual untuk menghindari bug scrollIntoView di Turbopack dev
    const rect = target.getBoundingClientRect()
    const scrollTop = window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2
    window.scrollTo({ top: scrollTop, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  if (!direction) return null

  return (
    <button
      type="button"
      onClick={scrollToActive}
      // Mobile: pojok kanan bawah, di atas BottomNav (56px).
      // Desktop: geser ke kiri agar jatuh di sisi kanan kolom tengah.
      //   right-sidebar ≈ 288px + gap 32px + safety 8px = ~328px dari edge.
      className="fixed bottom-20 right-4 z-50 lg:bottom-8 lg:right-[336px]
                 flex h-12 w-12 items-center justify-center
                 rounded-2xl border border-zinc-700 bg-zinc-800/90
                 text-brand-500 shadow-xl backdrop-blur-md
                 transition-all hover:bg-zinc-700 active:scale-95
                 cursor-pointer focus:outline-none"
      aria-label="Scroll ke pelajaran aktif"
    >
      {direction === 'down' ? (
        <ArrowDown size={22} strokeWidth={3} />
      ) : (
        <ArrowUp size={22} strokeWidth={3} />
      )}
    </button>
  )
}
