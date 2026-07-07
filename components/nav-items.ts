import { Map, Dumbbell, Flag, Trophy, User } from 'lucide-react'
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
  // exact: /game/[lessonId] datang dari Journey, jangan menyorot Practice
  { href: '/game', label: 'Practice', icon: Dumbbell, exact: true },
  { href: '/goals', label: 'Goals', icon: Flag },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]

/** Apakah `href` aktif untuk `pathname` saat ini (menghormati flag `exact`). */
export function isNavActive(pathname: string, item: NavItem): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`)
}
