import Link from 'next/link'
import { Play, BookOpen } from 'lucide-react'
import Mascot from '@/components/Mascot'
import { getUnitsWithLessons } from '@/lib/catalog'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { findNextLessonRef } from '@/lib/progress'

export default async function NextLessonCard() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null

  const [units, user] = await Promise.all([
    getUnitsWithLessons(),
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
      levelOrder: unit.level.order,
    })),
  )

  // Lesson berikutnya pada rantai wajib (level >= startLevelOrder user)
  const nextRef = findNextLessonRef(lessonRefs, completedIds, user?.startLevelOrder ?? 1)
  const nextUnit = nextRef
    ? units.find((u) => u.lessons.some((l) => l.id === nextRef.id))
    : undefined
  const nextLessonData = nextUnit?.lessons.find((l) => l.id === nextRef?.id)
  const nextLesson = nextLessonData
    ? { id: nextLessonData.id, title: nextLessonData.title, unitTitle: nextUnit!.title }
    : null

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen size={18} className="text-brand-600" aria-hidden />
        <h3 className="text-sm font-bold text-zinc-100">Lanjut Belajar</h3>
      </div>

      {nextLesson ? (
        <div>
          <p className="mb-0.5 text-xs text-zinc-500">{nextLesson.unitTitle}</p>
          <p className="mb-3 text-sm font-semibold text-zinc-100">{nextLesson.title}</p>
          <Link
            href={`/game/${nextLesson.id}`}
            id="next-lesson-play-btn"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:bg-brand-700"
          >
            <Play size={16} strokeWidth={2.5} aria-hidden />
            Main Sekarang
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-2">
          <Mascot pose="graduation" size={80} />
          <p className="text-center text-sm font-bold text-zinc-100">
            Semua Materi Selesai!
          </p>
          <p className="text-center text-xs text-zinc-400">
            Luar biasa! Kamu telah menuntaskan seluruh pelajaran yang tersedia.
          </p>
        </div>
      )}
    </div>
  )
}

