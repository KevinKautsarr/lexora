import { Target } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { isGoalMetToday, utcDateOnly } from '@/lib/streak'

const XP_GOAL = 50
const LESSON_GOAL = 1

export default async function DailyGoalsCard() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { xpToday: true, lastXpDate: true, lastActivityDate: true },
  })
  if (!user) return null

  const now = new Date()

  // Lesson hari ini: lastActivityDate di-set ke UTC-date-only saat lesson completed.
  const lessonDoneToday = isGoalMetToday(user.lastActivityDate, now) ? 1 : 0

  // XP hari ini: xpToday direset tiap hari baru (dikelola di submitScore).
  // Kalau lastXpDate bukan hari ini, xpToday sudah stale → anggap 0.
  const isToday =
    user.lastXpDate !== null &&
    utcDateOnly(new Date(user.lastXpDate)).getTime() === utcDateOnly(now).getTime()
  const xpToday = isToday ? user.xpToday : 0

  const goals = [
    {
      id: 'daily-lesson',
      label: 'Selesaikan 1 lesson',
      current: Math.min(lessonDoneToday, LESSON_GOAL),
      total: LESSON_GOAL,
      color: 'emerald',
    },
    {
      id: 'daily-xp',
      label: `Raih ${XP_GOAL} XP hari ini`,
      current: Math.min(xpToday, XP_GOAL),
      total: XP_GOAL,
      color: 'yellow',
    },
  ]

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Target size={18} className="text-emerald-400" aria-hidden />
        <h3 className="text-sm font-bold text-zinc-100">Daily Goals</h3>
      </div>

      <div className="flex flex-col gap-3">
        {goals.map((goal) => {
          const pct = Math.round((goal.current / goal.total) * 100)
          const done = goal.current >= goal.total
          return (
            <div key={goal.id}>
              <div className="mb-1 flex items-center justify-between">
                <span className={`text-xs font-medium ${done ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  {goal.label}
                </span>
                <span className="text-xs tabular-nums text-zinc-500">
                  {goal.current}/{goal.total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-700">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    done
                      ? 'bg-emerald-400'
                      : goal.color === 'yellow'
                        ? 'bg-yellow-400'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
