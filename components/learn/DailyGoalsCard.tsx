import { Gift, Target } from 'lucide-react'
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
      color: 'brand',
    },
    {
      id: 'daily-xp',
      label: `Raih ${XP_GOAL} XP hari ini`,
      current: Math.min(xpToday, XP_GOAL),
      total: XP_GOAL,
      color: 'xp',
    },
  ]

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Target size={18} className="text-brand-600" aria-hidden />
        <h3 className="text-sm font-bold text-zinc-100">Daily Goals</h3>
      </div>

      <div className="flex flex-col gap-4">
        {goals.map((goal) => {
          const pct = Math.round((goal.current / goal.total) * 100)
          const done = goal.current >= goal.total
          return (
            <div key={goal.id}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold ${done ? 'text-brand-700' : 'text-zinc-300'}`}>
                  {goal.label}
                </span>
                <span className="text-xs font-bold tabular-nums text-zinc-500">
                  {goal.current}/{goal.total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Progress bar + reward gift di ujung (pola Coddy) */}
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      done
                        ? 'bg-brand-500'
                        : goal.color === 'xp'
                          ? 'bg-xp-400'
                          : 'bg-brand-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <Gift
                  size={18}
                  className={done ? 'text-xp-500' : 'text-zinc-500'}
                  aria-label={done ? 'Hadiah terbuka' : 'Hadiah terkunci'}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
