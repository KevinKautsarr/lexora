import { Flame, Zap, Star } from 'lucide-react'
import { levelForXp } from '@/lib/level'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

// Bar statistik user di kanan atas — server component, data langsung dari Prisma.
export default async function UserStats() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { xp: true, streak: true },
  })
  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      <span
        title="Streak"
        className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1.5 text-sm font-bold text-orange-400"
      >
        <Flame size={16} aria-hidden />
        {user.streak}
      </span>
      <span
        title="XP"
        className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1.5 text-sm font-bold text-emerald-400"
      >
        <Zap size={16} aria-hidden />
        {user.xp}
      </span>
      <span
        title="Level"
        className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1.5 text-sm font-bold text-zinc-100"
      >
        <Star size={16} aria-hidden />
        Lv {levelForXp(user.xp)}
      </span>
    </div>
  )
}
