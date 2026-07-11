import { Map, Flame, Flag, Trophy, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Cocokkan href secara persis (mis. /game jangan aktif saat /game/[lessonId]). */
  exact?: boolean
}

// Sumber tunggal untuk navigasi — dipakai Sidebar (desktop) & BottomNav (mobile).
export const NAV_ITEMS: NavItem[] = [
  { href: '/learn', label: 'Journey', icon: Map },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/goals', label: 'Goals', icon: Flag },
  { href: '/streak', label: 'Streak', icon: Flame },
  { href: '/profile', label: 'Profile', icon: User },
]

/** Apakah `href` aktif untuk `pathname` saat ini (menghormati flag `exact`). */
export function isNavActive(pathname: string, item: NavItem): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`)
}
