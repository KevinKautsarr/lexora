'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS, isNavActive } from './nav-items'
import LogoutButton from './LogoutButton'

// Sidebar kiri — hanya tampil di desktop (lg+). Di mobile digantikan BottomNav.
export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-zinc-800 bg-zinc-950 lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link
          href="/learn"
          aria-label="LEXORA — beranda"
          translate="no"
          className="text-xl font-black tracking-wide text-brand-600"
        >
          LEXORA
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-zinc-800 text-brand-600'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-brand-500" />
              )}
              <Icon size={20} aria-hidden />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <LogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-red-600" />
      </div>
    </aside>
  )
}
