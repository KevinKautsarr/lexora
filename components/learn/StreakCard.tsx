import { Flame } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { isGoalMetToday } from '@/lib/streak'
import Mascot from '@/components/Mascot'

export default async function StreakCard() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { streak: true, longestStreak: true, lastActivityDate: true },
  })
  if (!user) return null

  const { streak, longestStreak } = user
  const activeToday = isGoalMetToday(user.lastActivityDate, new Date())
  const isInDanger = streak > 0 && !activeToday

  // Pose Lexi: berisiko → mengantuk (streak-danger); sudah belajar hari ini →
  // jempol (thumbsup); belum mulai → penjaga api (streak-keeper).
  const pose = isInDanger ? 'streak-danger' : activeToday ? 'thumbsup' : 'streak-keeper'

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Flame size={18} className="text-orange-500" aria-hidden />
        <h3 className="text-sm font-bold text-zinc-100">Streak Belajar</h3>
      </div>

      {/* Current streak — prominently displayed with mascot */}
      <div className={`mb-3 flex items-center gap-4 rounded-xl bg-zinc-900/40 p-3 border ${
        isInDanger ? 'border-orange-500/30' : 'border-zinc-700/40'
      }`}>
        <div className="shrink-0 rounded-lg bg-transparent p-1">
          <Mascot pose={pose} size={56} />
        </div>
        <div className="flex-1">
          <p className={`text-2xl font-black tabular-nums ${streak > 0 ? 'text-orange-500' : 'text-zinc-500'}`}>
            {streak} Hari
          </p>
          <p className="text-[10px] font-semibold text-zinc-400">
            {isInDanger ? 'Belajar hari ini untuk jaga streak!' : 'Streak kamu aman hari ini!'}
          </p>
        </div>
      </div>

      {/* Longest streak */}
      <div className="flex items-center justify-between rounded-lg bg-zinc-900/30 px-3 py-2 border border-zinc-800/50">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rekor Terbaik</span>
        <span className="flex items-center gap-1 text-sm font-black text-zinc-200">
          <Flame size={14} className="text-orange-500" aria-hidden />
          {longestStreak}
        </span>
      </div>
    </div>
  )
}

