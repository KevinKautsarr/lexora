'use server'

import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { nextStreak, utcDateOnly } from '@/lib/streak'
import { isLessonUnlockedForUser } from '@/lib/unlock'
import { computeScore } from './scoring'

export type SubmitScoreResult =
  | { ok: true; score: number; accuracy: number; completed: boolean; totalXp: number }
  | { ok: false; error: string }

export async function submitScore(
  lessonId: string,
  correctCount: number,
  attempts: number,
): Promise<SubmitScoreResult> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, error: 'Harus login dulu' }

  if (
    typeof lessonId !== 'string' ||
    !Number.isInteger(correctCount) ||
    !Number.isInteger(attempts) ||
    correctCount < 0 ||
    attempts < correctCount ||
    attempts > 10_000
  ) {
    return { ok: false, error: 'Input tidak valid' }
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { _count: { select: { words: true } } },
  })
  if (!lesson) return { ok: false, error: 'Lesson tidak ditemukan' }

  const wordCount = lesson._count.words
  if (correctCount > wordCount) return { ok: false, error: 'Input tidak valid' }

  // Lesson harus sudah terbuka untuk user ini — menembak URL /game/[lessonId]
  // langsung tidak bisa dipakai melompati urutan lesson.
  const unlocked = await isLessonUnlockedForUser(sessionUser.id, lessonId)
  if (!unlocked) return { ok: false, error: 'Lesson masih terkunci' }

  // Skor dihitung di server dari jumlah benar/percobaan — nilai skor
  // mentah dari client tidak pernah dipercaya.
  const completed = wordCount > 0 && correctCount === wordCount
  const { score, accuracy } = computeScore(correctCount, attempts, completed)

  const [existing, dbUser] = await Promise.all([
    prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: sessionUser.id, lessonId } },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: { streak: true, longestStreak: true, lastActivityDate: true, xpToday: true, lastXpDate: true },
    }),
  ])

  // Skor & akurasi tersimpan mengikuti run dengan skor terbaik.
  const improved = score > (existing?.score ?? -1)

  // Streak hanya bergerak saat user MENYELESAIKAN lesson (bukan sekadar main).
  const now = new Date()
  const newStreak = completed
    ? nextStreak(dbUser.streak, dbUser.lastActivityDate, now)
    : dbUser.streak
  const streakUpdate = completed
    ? {
        streak: newStreak,
        longestStreak: Math.max(dbUser.longestStreak, newStreak),
        lastActivityDate: utcDateOnly(now),
      }
    : {}

  // Hitung xpToday: reset jika hari baru (UTC), tambah jika hari sama.
  const today = utcDateOnly(now)
  const isNewXpDay =
    !dbUser.lastXpDate ||
    utcDateOnly(new Date(dbUser.lastXpDate)).getTime() !== today.getTime()
  const xpTodayUpdate = isNewXpDay
    ? { xpToday: score, lastXpDate: today }
    : { xpToday: { increment: score }, lastXpDate: today }

  const [, updatedUser] = await prisma.$transaction([
    prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: sessionUser.id, lessonId } },
      update: {
        completed: completed || (existing?.completed ?? false),
        ...(improved ? { score, accuracy } : {}),
      },
      create: { userId: sessionUser.id, lessonId, completed, score, accuracy },
    }),
    prisma.user.update({
      where: { id: sessionUser.id },
      data: { xp: { increment: score }, ...streakUpdate, ...xpTodayUpdate },
    }),
  ])

  return { ok: true, score, accuracy, completed, totalXp: updatedUser.xp }
}
