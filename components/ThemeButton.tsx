'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

/**
 * Tombol toggle tema tunggal (terang ↔ gelap) untuk navbar landing.
 * Memakai localStorage + data-theme yang sama dengan ThemeToggle di Settings,
 * jadi preferensi konsisten di seluruh situs. "system" tidak ditawarkan di
 * sini (tombol tunggal); memilih terang/gelap = override eksplisit.
 */
export default function ThemeButton({ className = '' }: { className?: string }) {
  // null saat SSR → hindari mismatch; diisi setelah mount dari sumber yang
  // sama dengan script anti-flash (localStorage) atau preferensi OS.
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') {
        setIsDark(stored === 'dark')
      } else {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
      }
    })
    return () => cancelAnimationFrame(rafId)
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  // Placeholder ukuran sama sebelum mount → tak ada layout shift.
  if (isDark === null) {
    return <span className={`inline-block h-9 w-9 ${className}`} aria-hidden />
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      title={isDark ? 'Mode terang' : 'Mode gelap'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-700/60 bg-zinc-900/40 text-zinc-300 transition-colors hover:border-brand-500 hover:text-brand-500 cursor-pointer ${className}`}
    >
      {isDark ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  )
}
