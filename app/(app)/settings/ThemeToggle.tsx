'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'system', label: 'Sistem', icon: Monitor },
]

/** Terapkan tema ke <html>: 'system' menghapus data-theme (biar @media yang
 *  menentukan), 'light'/'dark' menstampnya. */
function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    root.removeAttribute('data-theme')
    localStorage.removeItem('theme')
  } else {
    root.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }
}

export default function ThemeToggle() {
  // null saat SSR/first paint → hindari mismatch; diisi setelah mount dari
  // localStorage (source of truth yang sama dengan script anti-flash).
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    setTheme(stored === 'light' || stored === 'dark' ? stored : 'system')
  }, [])

  function choose(next: Theme) {
    setTheme(next)
    applyTheme(next)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Pilih tema tampilan"
      className="grid grid-cols-3 gap-2"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(value)}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors cursor-pointer ${
              active
                ? 'border-brand-500 bg-brand-500/10 text-brand-600'
                : 'border-zinc-700/60 bg-zinc-900/40 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            <Icon size={22} aria-hidden />
            <span className="text-xs font-bold">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
