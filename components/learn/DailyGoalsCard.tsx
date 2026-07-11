import { Target } from 'lucide-react'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { isGoalMetToday, wibDateOnly } from '@/lib/streak'

const XP_GOAL = 50
const LESSON_GOAL = 1
const PERFECT_GOAL = 3

export default async function DailyGoalsCard() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      xpToday: true,
      lastXpDate: true,
      lastActivityDate: true,
      perfectToday: true,
      lastPerfectDate: true,
    },
  })
  if (!user) return null

  const now = new Date()
  const todayMs = wibDateOnly(now).getTime()

  // Lesson hari ini: lastActivityDate di-set ke UTC-date-only saat lesson completed.
  const lessonDoneToday = isGoalMetToday(user.lastActivityDate, now) ? 1 : 0

  // XP hari ini: xpToday direset tiap hari baru (dikelola di submitScore).
  // Kalau lastXpDate bukan hari ini, xpToday sudah stale → anggap 0.
  const xpToday =
    user.lastXpDate && wibDateOnly(new Date(user.lastXpDate)).getTime() === todayMs
      ? user.xpToday
      : 0

  // Lesson sempurna (akurasi 100%) hari ini — sama pola stale-check-nya.
  const perfectToday =
    user.lastPerfectDate &&
    wibDateOnly(new Date(user.lastPerfectDate)).getTime() === todayMs
      ? user.perfectToday
      : 0

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
    {
      id: 'daily-perfect',
      label: `Selesaikan ${PERFECT_GOAL} lesson sempurna`,
      current: Math.min(perfectToday, PERFECT_GOAL),
      total: PERFECT_GOAL,
      color: 'brand',
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
                {/* Progress bar + reward chest PNG */}
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-700">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${
                      done
                        ? 'bg-brand-500'
                        : goal.color === 'xp'
                          ? 'bg-xp-400'
                          : 'bg-brand-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {/* Ganti RewardChest SVG dengan aset PNG kustom */}
                <div className="relative h-7 w-7 shrink-0 select-none">
                  <Image
                    src={done ? '/icons-flat/128/chest-gold-glow.png' : '/icons-flat/128/chest-locked-grey.png'}
                    alt={done ? 'Hadiah terbuka' : 'Hadiah terkunci'}
                    fill
                    sizes="28px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
