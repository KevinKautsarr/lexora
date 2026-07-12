import { Map, Flame, Flag, Trophy, User, BookA, ShoppingBag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Cocokkan href secara persis (mis. /game jangan aktif saat /game/[lessonId]). */
  exact?: boolean
}

// Sumber tunggal untuk navigasi — dipakai Sidebar (desktop, semua item rata)
// & BottomNav (mobile, dipecah primary/overflow — lihat di bawah).
export const NAV_ITEMS: NavItem[] = [
  { href: '/learn', label: 'Journey', icon: Map },
  { href: '/dictionary', label: 'Kamus', icon: BookA },
  { href: '/leaderboard', label: 'Liga', icon: Trophy },
  { href: '/goals', label: 'Goals', icon: Flag },
  { href: '/streak', label: 'Streak', icon: Flame },
  { href: '/shop', label: 'Toko', icon: ShoppingBag },
  { href: '/profile', label: 'Profil', icon: User },
]

// Bottom nav mobile: guideline UX membatasi ≤5 slot agar tiap target tetap
// mudah dijangkau jempol. 4 dipilih untuk jalur inti (belajar, referensi,
// kompetisi, kebiasaan harian) + 1 slot "Lainnya" untuk sisanya.
export const BOTTOM_NAV_PRIMARY_HREFS = ['/learn', '/dictionary', '/leaderboard', '/streak']

/** Apakah `href` aktif untuk `pathname` saat ini (menghormati flag `exact`). */
export function isNavActive(pathname: string, item: NavItem): boolean {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`)
}
