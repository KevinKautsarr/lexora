import 'server-only'
import { prisma } from './prisma'

export type CefrLevel = { code: string; name: string; order: number }

/**
 * Tingkat CEFR user saat ini = level TERJAUH yang sudah punya lesson completed,
 * minimal setara startLevelOrder (level tempat user memulai). Ini berbeda dari
 * "Level" XP (floor(xp/500)+1) — di UI: "Tingkat" = CEFR, "Level" = XP.
 */
export async function getCurrentCefrLevel(
  userId: string,
  startLevelOrder: number,
): Promise<CefrLevel | null> {
  const furthest = await prisma.lessonProgress.findFirst({
    where: { userId, completed: true },
    orderBy: [
      { lesson: { unit: { level: { order: 'desc' } } } },
      { lesson: { unit: { order: 'desc' } } },
    ],
    select: {
      lesson: { select: { unit: { select: { level: { select: { order: true } } } } } },
    },
  })

  const reachedOrder = Math.max(
    startLevelOrder,
    furthest?.lesson.unit.level.order ?? 0,
  )

  return prisma.level.findUnique({
    where: { order: reachedOrder },
    select: { code: true, name: true, order: true },
  })
}
