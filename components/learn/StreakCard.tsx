import { Flame } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export default async function StreakCard() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { streak: true, longestStreak: true },
  })
  if (!user) return null

  const { streak, longestStreak } = user

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Flame size={18} className="text-orange-600" aria-hidden />
        <h3 className="text-sm font-bold text-zinc-100">Streak</h3>
      </div>

      {/* Current streak — prominently displayed */}
      <div className="mb-3 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 py-4 border border-orange-200">
        <Flame
          size={40}
          className={streak > 0 ? 'text-orange-500' : 'text-zinc-600'}
          aria-hidden
        />
        <div className="text-center">
          <p className={`text-4xl font-black tabular-nums ${streak > 0 ? 'text-orange-600' : 'text-zinc-600'}`}>
            {streak}
          </p>
          <p className="text-xs text-zinc-500">hari berturut-turut</p>
        </div>
      </div>

      {/* Longest streak */}
      <div className="flex items-center justify-between rounded-lg bg-zinc-700/30 px-3 py-2">
        <span className="text-xs text-zinc-400">Streak terpanjang</span>
        <span className="flex items-center gap-1 text-sm font-bold text-zinc-200">
          <Flame size={14} className="text-orange-500" aria-hidden />
          {longestStreak}
        </span>
      </div>
    </div>
  )
}
