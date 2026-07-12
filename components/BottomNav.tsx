'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MoreHorizontal, X } from 'lucide-react'
import { NAV_ITEMS, BOTTOM_NAV_PRIMARY_HREFS, isNavActive, type NavItem } from './nav-items'

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold transition-colors ${
        active ? 'text-brand-600' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      <Icon size={22} aria-hidden strokeWidth={active ? 2.5 : 2} />
      <span className="max-w-full truncate leading-none">{item.label}</span>
    </Link>
  )
}

// Navbar bawah — hanya tampil di mobile (< lg). Sidebar mengambil alih di lg+.
// 4 item inti tetap 1-tap; sisanya di balik "Lainnya" agar target sentuh
// tidak menyempit saat item bertambah (guideline: bottom nav ≤5 slot).
export default function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const sheetId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const primaryItems = NAV_ITEMS.filter((item) =>
    BOTTOM_NAV_PRIMARY_HREFS.includes(item.href),
  )
  const overflowItems = NAV_ITEMS.filter(
    (item) => !BOTTOM_NAV_PRIMARY_HREFS.includes(item.href),
  )
  const overflowActive = overflowItems.some((item) => isNavActive(pathname, item))

  // Tutup otomatis saat pathname berubah (navigasi lewat item di sheet).
  useEffect(() => {
    const rafId = requestAnimationFrame(() => setMoreOpen(false))
    return () => cancelAnimationFrame(rafId)
  }, [pathname])

  // Esc menutup sheet — pola standar untuk overlay modal-like.
  useEffect(() => {
    if (!moreOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMoreOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [moreOpen])

  return (
    <>
      {/* Backdrop — klik di luar sheet menutup, tanpa menutupi bottom nav itu sendiri */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden animate-[fadeIn_150ms_ease-out]"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        .bottom-sheet { animation: sheetUp 200ms cubic-bezier(0.32, 0.72, 0, 1); }
        @media (prefers-reduced-motion: reduce) {
          .bottom-sheet { animation: none; }
        }
      `}</style>

      {/* Sheet "Lainnya" — muncul dari bawah, tepat di atas bottom nav */}
      {moreOpen && (
        <div
          id={sheetId}
          role="dialog"
          aria-modal="true"
          aria-label="Menu lainnya"
          className="bottom-sheet fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40 rounded-t-3xl border-t border-x border-zinc-800 bg-zinc-950 pb-2 pt-3 shadow-2xl lg:hidden"
        >
          <div className="mx-auto flex max-w-md items-center justify-between px-5 pb-2">
            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Lainnya
            </p>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              aria-label="Tutup menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          <ul className="mx-auto grid max-w-md grid-cols-3 gap-1 px-3 pb-1">
            {overflowItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  item={item}
                  active={isNavActive(pathname, item)}
                  onNavigate={() => setMoreOpen(false)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur lg:hidden"
        // Sisakan ruang untuk home-indicator / notch di perangkat full-bleed.
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {primaryItems.map((item) => (
            <li key={item.href} className="flex-1">
              <NavLink item={item} active={isNavActive(pathname, item)} />
            </li>
          ))}
          <li className="flex-1">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-label="Menu lainnya"
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              aria-controls={sheetId}
              className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold transition-colors cursor-pointer ${
                moreOpen || overflowActive
                  ? 'text-brand-600'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MoreHorizontal
                size={22}
                aria-hidden
                strokeWidth={moreOpen || overflowActive ? 2.5 : 2}
              />
              <span className="max-w-full truncate leading-none">Lainnya</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
