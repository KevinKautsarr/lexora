// Logika unlock murni — tanpa prisma/IO — supaya gampang di-test dan
// dipakai baik untuk render halaman maupun validasi server action.

export type LessonOrderRef = {
  id: string
  order: number
  unitOrder: number
  levelOrder: number
}

/** Urutan global: level.order → unit.order → lesson.order. */
export function sortLessonRefs(lessons: LessonOrderRef[]): LessonOrderRef[] {
  return [...lessons].sort(
    (a, b) => a.levelOrder - b.levelOrder || a.unitOrder - b.unitOrder || a.order - b.order,
  )
}

/**
 * Aturan unlock berlevel:
 * - Semua lesson pada level DI BAWAH startLevelOrder selalu terbuka
 *   (boleh dimainkan kapan saja, di luar rantai wajib).
 * - Lesson pertama pada level startLevelOrder terbuka.
 * - Sisanya berantai: terbuka jika lesson tepat sebelumnya (dalam urutan
 *   global, mulai dari level startLevelOrder) sudah completed.
 * - Lesson yang sudah completed selalu terbuka (bisa dimainkan ulang).
 */
export function computeUnlockedLessonIds(
  lessons: LessonOrderRef[],
  completedLessonIds: ReadonlySet<string>,
  startLevelOrder = 1,
): Set<string> {
  const sorted = sortLessonRefs(lessons)
  const unlocked = new Set<string>()
  let previousChainLesson: LessonOrderRef | null = null

  for (const lesson of sorted) {
    if (lesson.levelOrder < startLevelOrder) {
      unlocked.add(lesson.id)
      continue
    }
    if (
      previousChainLesson === null ||
      completedLessonIds.has(previousChainLesson.id) ||
      completedLessonIds.has(lesson.id)
    ) {
      unlocked.add(lesson.id)
    }
    previousChainLesson = lesson
  }
  return unlocked
}

export function isLessonUnlocked(
  lessonId: string,
  lessons: LessonOrderRef[],
  completedLessonIds: ReadonlySet<string>,
  startLevelOrder = 1,
): boolean {
  return computeUnlockedLessonIds(lessons, completedLessonIds, startLevelOrder).has(lessonId)
}

/**
 * Lesson berikutnya yang harus dikerjakan: lesson pertama pada rantai wajib
 * (level >= startLevelOrder) yang terbuka tapi belum completed. Lesson level
 * bawah yang bebas dimainkan tidak pernah jadi "berikutnya".
 */
export function findNextLessonRef(
  lessons: LessonOrderRef[],
  completedLessonIds: ReadonlySet<string>,
  startLevelOrder = 1,
): LessonOrderRef | null {
  const unlocked = computeUnlockedLessonIds(lessons, completedLessonIds, startLevelOrder)
  return (
    sortLessonRefs(lessons).find(
      (lesson) =>
        lesson.levelOrder >= startLevelOrder &&
        unlocked.has(lesson.id) &&
        !completedLessonIds.has(lesson.id),
    ) ?? null
  )
}
