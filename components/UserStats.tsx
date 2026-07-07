import { Flame, Star, Zap } from 'lucide-react'
import { levelForXp } from '@/lib/level'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

// Kartu statistik ringkas untuk sidebar kanan Journey — server component,
// data langsung dari Prisma. Streak (oranye), XP (emas), Level (hijau).
export default async function UserStats() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { xp: true, streak: true },
  })
  if (!user) return null

  const tiles = [
    {
      label: 'Streak',
      value: user.streak,
      icon: Flame,
      color: 'text-orange-600',
      ariaLabel: `Streak: ${user.streak} hari`,
    },
    {
      label: 'XP',
      value: user.xp,
      icon: Zap,
      color: 'text-xp-600',
      ariaLabel: `XP: ${user.xp}`,
    },
    {
      label: 'Level',
      value: levelForXp(user.xp),
      icon: Star,
      color: 'text-brand-600',
      ariaLabel: `Level ${levelForXp(user.xp)}`,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {tiles.map(({ label, value, icon: Icon, color, ariaLabel }) => (
        <div
          key={label}
          aria-label={ariaLabel}
          className="flex flex-col items-center gap-1 rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-3"
        >
          <Icon size={18} className={color} aria-hidden />
          <span className={`text-lg font-black tabular-nums ${color}`}>{value}</span>
          <span className="text-[10px] font-semibold text-zinc-500">{label}</span>
        </div>
      ))}
    </div>
  )
}
