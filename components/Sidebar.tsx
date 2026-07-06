'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Map, Dumbbell, LayoutDashboard, Trophy, User, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

const NAV_ITEMS = [
  { href: '/learn', label: 'Journey', icon: Map },
  // exact: /game/[lessonId] datang dari Journey, jangan menyorot Practice
  { href: '/game', label: 'Practice', icon: Dumbbell, exact: true },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await authClient.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-zinc-800 bg-zinc-950 lg:w-56">
      <div className="flex h-16 items-center justify-center lg:justify-start lg:px-5">
        <Link
          href="/learn"
          aria-label="LEXORA — beranda"
          translate="no"
          className="text-xl font-black tracking-wide text-emerald-400"
        >
          <span className="lg:hidden" aria-hidden>L</span>
          <span className="hidden lg:inline">LEXORA</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-4 lg:px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors lg:justify-start ${
                active
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-emerald-500" />
              )}
              <Icon size={20} aria-hidden />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-2 pb-4 lg:px-3">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-red-400 lg:justify-start"
        >
          <LogOut size={20} aria-hidden />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </aside>
  )
}
