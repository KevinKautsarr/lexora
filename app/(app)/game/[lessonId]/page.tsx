import { notFound, redirect } from 'next/navigation'
import { getUnitsWithLessons } from '@/lib/catalog'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { isLessonUnlockedForUser } from '@/lib/unlock'
import { findNextLessonRef } from '@/lib/progress'
import MatchMadness from '../MatchMadness'

export default async function LessonGamePage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const { lessonId } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { words: true, unit: { include: { level: true } } },
  })
  if (!lesson || lesson.words.length === 0) notFound()

  const unlocked = await isLessonUnlockedForUser(sessionUser.id, lesson.id)
  if (!unlocked) redirect('/learn')

  const pairs = lesson.words.map((word) => ({
    id: word.id,
    english: word.term,
    indonesian: word.translation,
  }))

  // Cari lesson berikutnya pada rantai wajib dengan simulasi lesson ini
  // sudah selesai — untuk tombol "Lesson Berikutnya" di layar hasil.
  const [allUnits, userProgress, dbUser] = await Promise.all([
    getUnitsWithLessons(),
    prisma.lessonProgress.findMany({
      where: { userId: sessionUser.id, completed: true },
      select: { lessonId: true },
    }),
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { startLevelOrder: true },
    }),
  ])

  const completedIds = new Set(userProgress.map((p) => p.lessonId))
  completedIds.add(lesson.id)

  const lessonRefs = allUnits.flatMap((unit) =>
    unit.lessons.map((l) => ({
      id: l.id,
      order: l.order,
      unitOrder: unit.order,
      levelOrder: unit.level.order,
    })),
  )
  const nextLesson = findNextLessonRef(
    lessonRefs,
    completedIds,
    dbUser?.startLevelOrder ?? 1,
  )

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <p className="text-sm text-zinc-400">
        {lesson.unit.level.code} · {lesson.unit.title} · {lesson.title}
      </p>
      <MatchMadness pairs={pairs} lessonId={lesson.id} nextLessonId={nextLesson?.id ?? null} />
    </div>
  )
}
