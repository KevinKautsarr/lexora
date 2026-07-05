import { prisma } from './prisma'
import { computeUnlockedLessonIds, type LessonOrderRef } from './progress'

export async function fetchLessonOrderRefs(): Promise<LessonOrderRef[]> {
  const lessons = await prisma.lesson.findMany({
    select: {
      id: true,
      order: true,
      unit: { select: { order: true, level: { select: { order: true } } } },
    },
  })
  return lessons.map((l) => ({
    id: l.id,
    order: l.order,
    unitOrder: l.unit.order,
    levelOrder: l.unit.level.order,
  }))
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
  const [lessons, completed, user] = await Promise.all([
    fetchLessonOrderRefs(),
    fetchCompletedLessonIds(userId),
    userId
      ? prisma.user.findUnique({ where: { id: userId }, select: { startLevelOrder: true } })
      : Promise.resolve(null),
  ])
  return computeUnlockedLessonIds(lessons, completed, user?.startLevelOrder ?? 1).has(lessonId)
}
