'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, isNavActive } from './nav-items'

// Navbar bawah — hanya tampil di mobile (< lg). Sidebar mengambil alih di lg+.
export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur lg:hidden"
      // Sisakan ruang untuk home-indicator / notch di perangkat full-bleed.
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item)
          const Icon = item.icon
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold transition-colors ${
                  active
                    ? 'text-brand-600'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={22} aria-hidden strokeWidth={active ? 2.5 : 2} />
                <span className="max-w-full truncate leading-none">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
