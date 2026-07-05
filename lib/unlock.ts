import { prisma } from './prisma'
import { computeUnlockedLessonIds, type LessonOrderRef } from './progress'

export async function fetchLessonOrderRefs(): Promise<LessonOrderRef[]> {
  const lessons = await prisma.lesson.findMany({
    select: { id: true, order: true, unit: { select: { order: true } } },
  })
  return lessons.map((l) => ({ id: l.id, order: l.order, unitOrder: l.unit.order }))
}

export async function fetchCompletedLessonIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set()
  const progress = await prisma.lessonProgress.findMany({
    where: { userId, completed: true },
    select: { lessonId: true },
  })
  return new Set(progress.map((p) => p.lessonId))
}

export async function isLessonUnlockedForUser(
  userId: string | null,
  lessonId: string,
): Promise<boolean> {
  const [lessons, completed] = await Promise.all([
    fetchLessonOrderRefs(),
    fetchCompletedLessonIds(userId),
  ])
  return computeUnlockedLessonIds(lessons, completed).has(lessonId)
}
