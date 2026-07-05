import { ArrowRight, CheckCircle2, Flame, PartyPopper, Target } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentCefrLevel } from '@/lib/cefr'
import { levelProgress, xpForNextLevel } from '@/lib/level'
import { prisma } from '@/lib/prisma'
import { findNextLessonRef } from '@/lib/progress'
import { getSessionUser } from '@/lib/session'
import { isGoalMetToday } from '@/lib/streak'

export default async function DashboardPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const [user, units, progress] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: {
        name: true,
        email: true,
        xp: true,
        streak: true,
        lastActivityDate: true,
        startLevelOrder: true,
      },
    }),
    prisma.unit.findMany({
      orderBy: [{ level: { order: 'asc' } }, { order: 'asc' }],
      include: { level: true, lessons: { orderBy: { order: 'asc' } } },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: sessionUser.id },
      select: { lessonId: true, completed: true, accuracy: true },
    }),
  ])

  const { level, xpInLevel, xpNeeded, fraction } = levelProgress(user.xp)

  const orderedLessons = units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      unitTitle: unit.title,
      order: lesson.order,
      unitOrder: unit.order,
      levelOrder: unit.level.order,
    })),
  )
  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))
  const nextRef = findNextLessonRef(orderedLessons, completedIds, user.startLevelOrder)
  const nextLesson = orderedLessons.find((lesson) => lesson.id === nextRef?.id)

  const accuracies = progress
    .map((p) => p.accuracy)
    .filter((a): a is number => a !== null)
  const avgAccuracy =
    accuracies.length > 0
      ? accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length
      : null

  const goalMet = isGoalMetToday(user.lastActivityDate, new Date())
  const cefr = await getCurrentCefrLevel(sessionUser.id, user.startLevelOrder)

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Ringkasan user + level */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">{user.name ?? user.email}</p>
            <p className="text-sm text-zinc-400">{user.xp} XP total</p>
          </div>
          <div className="flex items-center gap-2">
            {cefr && (
              <span
                className="rounded-full bg-zinc-700 px-3 py-2 text-sm font-bold text-zinc-200"
                title="Tingkat kemampuan CEFR"
              >
                Tingkat: {cefr.name} ({cefr.code})
              </span>
            )}
            <span
              className="rounded-full bg-emerald-500/15 px-4 py-2 text-lg font-bold text-emerald-400"
              title="Level dari XP"
            >
              Level {level}
            </span>
          </div>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-700">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${Math.round(fraction * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-zinc-400">
          {xpInLevel}/{xpNeeded} XP menuju level {level + 1} (total {xpForNextLevel(user.xp)} XP)
        </p>
      </section>

      {/* Statistik + streak */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-5 text-center">
          <p className="text-3xl font-extrabold">
            {completedIds.size}
            <span className="text-lg font-semibold text-zinc-500">/{orderedLessons.length}</span>
          </p>
          <p className="mt-1 text-sm text-zinc-400">Lesson selesai</p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-5 text-center">
          <p className="text-3xl font-extrabold">
            {avgAccuracy !== null ? `${Math.round(avgAccuracy * 100)}%` : '—'}
          </p>
          <p className="mt-1 text-sm text-zinc-400">Rata-rata akurasi</p>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-800/50 p-5 text-center">
          <p className="flex items-center justify-center gap-1 text-3xl font-extrabold">
            <Flame size={28} className="text-orange-400" aria-hidden />
            {user.streak}
          </p>
          <p className="mt-1 text-sm text-zinc-400">Streak hari</p>
        </section>
      </div>

      {/* Daily goal */}
      <section
        className={`flex items-center gap-3 rounded-2xl border p-5 ${
          goalMet
            ? 'border-emerald-800 bg-emerald-950/40'
            : 'border-amber-800 bg-amber-950/30'
        }`}
      >
        {goalMet ? (
          <CheckCircle2 size={20} className="shrink-0 text-emerald-400" aria-hidden />
        ) : (
          <Target size={20} className="shrink-0 text-amber-400" aria-hidden />
        )}
        <p className={`font-semibold ${goalMet ? 'text-emerald-300' : 'text-amber-300'}`}>
          {goalMet
            ? 'Goal hari ini tercapai — 1 lesson selesai!'
            : 'Goal hari ini: selesaikan 1 lesson untuk menjaga streak'}
        </p>
      </section>

      {/* Lanjut belajar */}
      {nextLesson ? (
        <Link
          href={`/game/${nextLesson.id}`}
          className="group rounded-2xl bg-emerald-600 px-6 py-4 text-center transition-colors hover:bg-emerald-500"
        >
          <span className="flex items-center justify-center gap-2 text-lg font-bold text-white">
            Lanjut belajar
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
          <span className="block text-sm text-emerald-100">
            {nextLesson.unitTitle} · {nextLesson.title}
          </span>
        </Link>
      ) : (
        <p className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-800 bg-emerald-950/40 px-6 py-4 text-center font-semibold text-emerald-300">
          <PartyPopper size={20} aria-hidden />
          Semua lesson sudah selesai!
        </p>
      )}
    </div>
  )
}
