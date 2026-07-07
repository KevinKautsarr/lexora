'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { nextStreak, utcDateOnly } from '@/lib/streak'
import { isLessonUnlockedForUser } from '@/lib/unlock'
import { computeScore, REPEATS_PER_WORD } from './scoring'
import { checkAndResetWeeklyLeagueGlobal } from '@/lib/league'

// Replay (lesson yang sudah pernah completed sebelumnya) hanya menyumbang
// 1/4 XP ke total user — skor & histori lessonProgress tetap dihitung penuh,
// supaya leaderboard/best-score tidak berubah, tapi mencegah farming XP
// dengan mengulang lesson yang sama berkali-kali.
const REPLAY_XP_FACTOR = 0.25

export type SubmitScoreResult =
  | {
      ok: true
      score: number
      accuracy: number
      completed: boolean
      totalXp: number
      xpGain: number
    }
  | { ok: false; error: string }

export async function submitScore(
  lessonId: string,
  correctCount: number,
  attempts: number,
): Promise<SubmitScoreResult> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, error: 'Harus login dulu' }

  // Run weekly league reset check
  await checkAndResetWeeklyLeagueGlobal()

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
  const totalMatches = wordCount * REPEATS_PER_WORD
  if (correctCount > totalMatches) return { ok: false, error: 'Input tidak valid' }

  // Lesson harus sudah terbuka untuk user ini — menembak URL /game/[lessonId]
  // langsung tidak bisa dipakai melompati urutan lesson.
  const unlocked = await isLessonUnlockedForUser(sessionUser.id, lessonId)
  if (!unlocked) return { ok: false, error: 'Lesson masih terkunci' }

  const [existing, dbUser] = await Promise.all([
    prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: sessionUser.id, lessonId } },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: {
        streak: true,
        longestStreak: true,
        lastActivityDate: true,
        xpToday: true,
        lastXpDate: true,
        perfectToday: true,
        lastPerfectDate: true,
      },
    }),
  ])

  // Skor dihitung di server dari jumlah benar/percobaan — nilai skor
  // mentah dari client tidak pernah dipercaya.
  const completed = totalMatches > 0 && correctCount === totalMatches
  const { score, accuracy } = computeScore(correctCount, attempts, totalMatches, completed)

  // Replay = lesson ini sudah pernah completed SEBELUM run ini. XP yang masuk
  // ke total user dipotong jadi 1/4; skor & histori lessonProgress tetap penuh.
  const isReplay = existing?.completed ?? false
  const xpGain = isReplay ? Math.round(score * REPLAY_XP_FACTOR) : score

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
  // xpGain (bukan score mentah) yang dihitung — supaya replay ×1/4 juga
  // tercermin di goal harian, bukan cuma total XP.
  const today = utcDateOnly(now)
  const isNewXpDay =
    !dbUser.lastXpDate ||
    utcDateOnly(new Date(dbUser.lastXpDate)).getTime() !== today.getTime()
  const xpTodayUpdate = isNewXpDay
    ? { xpToday: xpGain, lastXpDate: today }
    : { xpToday: { increment: xpGain }, lastXpDate: today }

  // Lesson "sempurna" = selesai dengan akurasi 100% (tanpa satu pun salah).
  // perfectToday reset tiap hari baru (UTC), sama seperti xpToday.
  const isPerfect = completed && accuracy === 1
  const isNewPerfectDay =
    !dbUser.lastPerfectDate ||
    utcDateOnly(new Date(dbUser.lastPerfectDate)).getTime() !== today.getTime()
  const perfectTodayUpdate = isPerfect
    ? isNewPerfectDay
      ? { perfectToday: 1, lastPerfectDate: today }
      : { perfectToday: { increment: 1 }, lastPerfectDate: today }
    : {}

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
      data: {
        xp: { increment: xpGain },
        xpThisWeek: { increment: xpGain },
        ...streakUpdate,
        ...xpTodayUpdate,
        ...perfectTodayUpdate,
      },
    }),
  ])

  // Segarkan seluruh tree layout supaya stats bar di header (streak/XP/level)
  // ikut ter-update dalam respons action yang sama, tanpa hard refresh.
  revalidatePath('/', 'layout')

  return { ok: true, score, accuracy, completed, totalXp: updatedUser.xp, xpGain }
}
