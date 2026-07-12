import { CheckCircle2, Sparkles, Target } from 'lucide-react'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { isGoalMetToday, wibDateOnly } from '@/lib/streak'
import GoalsHeroRing from '@/components/goals/GoalsHeroRing'
import Mascot from '@/components/Mascot'

const XP_GOAL = 50
const LESSON_GOAL = 1
const PERFECT_GOAL = 3

// Kutipan berganti tiap hari (deterministik dari tanggal WIB → aman dari
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


export const metadata = { title: 'Goals Harian' }

export default async function GoalsPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: {
      xpToday: true,
      lastXpDate: true,
      lastActivityDate: true,
      perfectToday: true,
      lastPerfectDate: true,
    },
  })

  const now = new Date()
  const todayMs = wibDateOnly(now).getTime()
  const lessonDoneToday = isGoalMetToday(user.lastActivityDate, now) ? 1 : 0
  const xpToday =
    user.lastXpDate && wibDateOnly(new Date(user.lastXpDate)).getTime() === todayMs
      ? user.xpToday
      : 0
  const perfectToday =
    user.lastPerfectDate &&
    wibDateOnly(new Date(user.lastPerfectDate)).getTime() === todayMs
      ? user.perfectToday
      : 0

  const goals = [
    {
      id: 'daily-lesson',
      // Konsisten dengan logika reward di game/actions.ts: sesi belajar apa
      // pun yang menghasilkan XP dihitung, tidak harus lesson sempurna.
      label: 'Belajar 1 sesi hari ini',
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
    {
      id: 'daily-perfect',
      label: `Selesaikan ${PERFECT_GOAL} lesson sempurna`,
      current: Math.min(perfectToday, PERFECT_GOAL),
      total: PERFECT_GOAL,
      barClass: 'bg-brand-500',
    },
  ]

  const goalsDone = goals.filter((g) => g.current >= g.total).length
  const allDone = goalsDone === goals.length

  // Indeks kutipan dari jumlah hari sejak epoch (WIB) → berganti tiap hari.
  const dayIndex = Math.floor(wibDateOnly(now).getTime() / 86_400_000)
  const quote = QUOTES[dayIndex % QUOTES.length]

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight">
        <Target size={26} className="text-brand-600" aria-hidden />
        Daily Goals
      </h1>

      {/* ── Hero: ring progres keseluruhan (signature) ── */}
      <GoalsHeroRing goalsDone={goalsDone} totalGoals={goals.length} allDone={allDone} />

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
      </section>

      {/* ── Perayaan: hanya saat SEMUA goal selesai ── */}
      {allDone && (
        <section
          className="relative flex flex-col items-center gap-3 overflow-hidden rounded-3xl border border-xp-400/60 bg-gradient-to-b from-xp-100 to-brand-100 p-6 text-center"
          aria-label="Semua goal harian selesai"
        >
          {/* Glow dekoratif */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--color-xp-400) 45%, transparent), transparent 60%)',
            }}
            aria-hidden
          />
          <Mascot
            mood="cheer"
            size={112}
            className="relative select-none drop-shadow-[0_8px_24px_rgba(224,176,74,0.45)]"
          />
          <div className="relative">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-brand-700">
              Semua goal selesai! 🎉
            </h2>
            <p className="mt-1 text-sm font-medium text-brand-600">
              Hadiah harian sudah kamu klaim. Sampai jumpa besok!
            </p>
          </div>
        </section>
      )}

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
