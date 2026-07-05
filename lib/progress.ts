// Logika unlock murni — tanpa prisma/IO — supaya gampang di-test dan
// dipakai baik untuk render halaman maupun validasi server action.

export type LessonOrderRef = {
  id: string
  order: number
  unitOrder: number
}

/**
 * Lesson pertama (urutan global: unitOrder lalu order) selalu terbuka.
 * Lesson lain terbuka jika lesson tepat sebelumnya sudah completed.
 * Lesson yang sudah completed selalu terbuka (bisa dimainkan ulang).
 */
export function computeUnlockedLessonIds(
  lessons: LessonOrderRef[],
  completedLessonIds: ReadonlySet<string>,
): Set<string> {
  const sorted = [...lessons].sort(
    (a, b) => a.unitOrder - b.unitOrder || a.order - b.order,
  )
  const unlocked = new Set<string>()
  for (let i = 0; i < sorted.length; i++) {
    const lesson = sorted[i]
    if (
      i === 0 ||
      completedLessonIds.has(sorted[i - 1].id) ||
      completedLessonIds.has(lesson.id)
    ) {
      unlocked.add(lesson.id)
    }
  }
  return unlocked
}

export function isLessonUnlocked(
  lessonId: string,
  lessons: LessonOrderRef[],
  completedLessonIds: ReadonlySet<string>,
): boolean {
  return computeUnlockedLessonIds(lessons, completedLessonIds).has(lessonId)
}
