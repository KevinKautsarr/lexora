import Link from 'next/link'
import { Play, BookOpen } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { computeUnlockedLessonIds } from '@/lib/progress'

export default async function NextLessonCard() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

  const [units, user] = await Promise.all([
    prisma.unit.findMany({
      orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' } } },
    }),
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { lessonProgress: { where: { completed: true } } },
    }),
  ])

  const completedIds = new Set(user?.lessonProgress.map((p) => p.lessonId) ?? [])
  const lessonRefs = units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({
      id: lesson.id,
      order: lesson.order,
      unitOrder: unit.order,
    })),
  )
  const unlockedIds = computeUnlockedLessonIds(lessonRefs, completedIds)

  // Temukan lesson unlocked pertama yang belum completed
  let nextLesson: { id: string; title: string; unitTitle: string } | null = null

  outer: for (const unit of units) {
    for (const lesson of unit.lessons) {
      if (unlockedIds.has(lesson.id) && !completedIds.has(lesson.id)) {
        nextLesson = { id: lesson.id, title: lesson.title, unitTitle: unit.title }
        break outer
      }
    }
  }

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen size={18} className="text-emerald-400" aria-hidden />
        <h3 className="text-sm font-bold text-zinc-100">Lanjut Belajar</h3>
      </div>

      {nextLesson ? (
        <div>
          <p className="mb-0.5 text-xs text-zinc-500">{nextLesson.unitTitle}</p>
          <p className="mb-3 text-sm font-semibold text-zinc-100">{nextLesson.title}</p>
          <Link
            href={`/game/${nextLesson.id}`}
            id="next-lesson-play-btn"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-400 active:bg-emerald-600"
          >
            <Play size={16} strokeWidth={2.5} aria-hidden />
            Main Sekarang
          </Link>
        </div>
      ) : (
        <p className="text-center text-sm text-zinc-500">
          🎉 Semua lesson sudah selesai!
        </p>
      )}
    </div>
  )
}
