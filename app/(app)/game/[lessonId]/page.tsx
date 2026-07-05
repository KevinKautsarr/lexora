import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { isLessonUnlockedForUser } from '@/lib/unlock'
import { computeUnlockedLessonIds } from '@/lib/progress'
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
    include: { words: true, unit: true },
  })
  if (!lesson || lesson.words.length === 0) notFound()

  const unlocked = await isLessonUnlockedForUser(sessionUser.id, lesson.id)
  if (!unlocked) redirect('/learn')

  const pairs = lesson.words.map((word) => ({
    id: word.id,
    english: word.term,
    indonesian: word.translation,
  }))

  // Cari lesson berikutnya yang unlocked setelah lesson ini selesai.
  // Ambil data lengkap untuk simulasi unlock post-completion.
  const [allUnits, userProgress] = await Promise.all([
    prisma.unit.findMany({
      orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' } } },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: sessionUser.id, completed: true },
      select: { lessonId: true },
    }),
  ])

  const completedIds = new Set(userProgress.map((p) => p.lessonId))
  // Simulasikan lesson ini sudah selesai untuk cari "next" yang akan unlock.
  completedIds.add(lesson.id)

  const lessonRefs = allUnits.flatMap((unit) =>
    unit.lessons.map((l) => ({ id: l.id, order: l.order, unitOrder: unit.order }))
  )
  const unlockedAfterThis = computeUnlockedLessonIds(lessonRefs, completedIds)

  // Urutkan semua lesson secara global, cari lesson pertama setelah yang ini
  // yang unlocked tapi belum completed (tanpa lesson ini).
  const sortedLessons = [...lessonRefs].sort(
    (a, b) => a.unitOrder - b.unitOrder || a.order - b.order,
  )
  const currentIdx = sortedLessons.findIndex((l) => l.id === lesson.id)
  const nextLesson = sortedLessons
    .slice(currentIdx + 1)
    .find(
      (l) =>
        unlockedAfterThis.has(l.id) &&
        !userProgress.map((p) => p.lessonId).includes(l.id),
    ) ?? null

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <p className="text-sm text-zinc-400">
        {lesson.unit.title} · {lesson.title}
      </p>
      <MatchMadness pairs={pairs} lessonId={lesson.id} nextLessonId={nextLesson?.id ?? null} />
    </div>
  )
}
