import { CheckCircle2, Gift, Sparkles, Target, Trophy } from 'lucide-react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { isGoalMetToday, utcDateOnly } from '@/lib/streak'
import DailyResetCountdown from '@/components/DailyResetCountdown'

const XP_GOAL = 50
const LESSON_GOAL = 1

// Kutipan berganti tiap hari (deterministik dari tanggal UTC → aman dari
// hydration mismatch, dihitung di server).
const QUOTES = [
  'Sedikit demi sedikit, lama-lama jadi bukit.',
  'Konsistensi mengalahkan intensitas. Satu lesson hari ini sudah cukup.',
  'Bahasa baru, dunia baru. Teruskan langkahmu!',
  'Kemajuan kecil tetap kemajuan. Bangga sama dirimu.',
  'Yang penting bukan cepat, tapi tidak berhenti.',
  'Setiap kata baru adalah satu pintu yang terbuka.',
  'Hari ini belajar, besok lebih lancar.',
]

export default async function GoalsPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { xpToday: true, lastXpDate: true, lastActivityDate: true },
  })

  const now = new Date()
  const lessonDoneToday = isGoalMetToday(user.lastActivityDate, now) ? 1 : 0
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
      barClass: 'bg-brand-500',
    },
    {
      id: 'daily-xp',
      label: `Raih ${XP_GOAL} XP hari ini`,
      current: Math.min(xpToday, XP_GOAL),
      total: XP_GOAL,
      barClass: 'bg-xp-400',
    },
  ]

  const allDone = goals.every((g) => g.current >= g.total)

  // Indeks kutipan dari jumlah hari sejak epoch (UTC) → berganti tiap hari.
  const dayIndex = Math.floor(utcDateOnly(now).getTime() / 86_400_000)
  const quote = QUOTES[dayIndex % QUOTES.length]

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <Target size={26} className="text-brand-600" aria-hidden />
          Daily Goals
        </h1>
        <DailyResetCountdown />
      </header>

      {/* ── List goal besar + reward peti ── */}
      <section className="flex flex-col gap-5 rounded-3xl border border-zinc-700 bg-zinc-800/50 p-6">
        {goals.map((goal) => {
          const pct = Math.round((goal.current / goal.total) * 100)
          const done = goal.current >= goal.total
          return (
            <div key={goal.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span
                  className={`flex items-center gap-1.5 text-sm font-bold ${
                    done ? 'text-brand-700' : 'text-zinc-100'
                  }`}
                >
                  {done && <CheckCircle2 size={16} className="text-brand-600" aria-hidden />}
                  {goal.label}
                </span>
                <span className="text-sm font-bold tabular-nums text-zinc-500">
                  {goal.current}/{goal.total}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-zinc-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${goal.barClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <Gift
                  size={22}
                  className={done ? 'text-xp-500' : 'text-zinc-500'}
                  aria-label={done ? 'Hadiah terbuka' : 'Hadiah terkunci'}
                />
              </div>
            </div>
          )
        })}
      </section>

      {/* ── Conquer them all ── */}
      <section
        className={`relative flex items-center gap-4 overflow-hidden rounded-3xl border p-6 ${
          allDone
            ? 'border-brand-300 bg-brand-100'
            : 'border-zinc-700 bg-zinc-800/50'
        }`}
      >
        <Trophy
          size={40}
          className={allDone ? 'shrink-0 text-xp-500' : 'shrink-0 text-zinc-500'}
          aria-hidden
        />
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-zinc-100">
            {allDone ? 'Semua goal tercapai! 🎉' : 'Taklukkan semua'}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            {allDone
              ? 'Kerja bagus hari ini. Goal baru menunggu besok.'
              : 'Selesaikan semua goal untuk mengklaim hadiah. Goal di-reset tiap hari.'}
          </p>
        </div>
      </section>

      {/* ── Motivational quote ── */}
      <section className="flex items-start gap-3 rounded-3xl border border-zinc-700 bg-zinc-800/30 p-6">
        <Sparkles size={20} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">
            Kutipan hari ini
          </p>
          <p className="mt-1 text-pretty font-medium text-zinc-200">{quote}</p>
        </div>
      </section>
    </div>
  )
}
