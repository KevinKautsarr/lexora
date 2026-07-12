'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { nextStreakWithFreeze, wibDateOnly } from '@/lib/streak'
import { isLessonUnlockedForUser } from '@/lib/unlock'
import { computeScore, REPEATS_PER_WORD } from './scoring'
import { checkAndResetWeeklyLeagueGlobal } from '@/lib/league'
import { verifyGameToken } from '@/lib/game-token'

// Replay (lesson yang sudah pernah completed sebelumnya) hanya menyumbang
// 1/4 XP ke total user — skor & histori lessonProgress tetap dihitung penuh,
// supaya leaderboard/best-score tidak berubah, tapi mencegah farming XP
// dengan mengulang lesson yang sama berkali-kali.
const REPLAY_XP_FACTOR = 0.25

// Booster duration in minutes
const BOOSTER_1_5X_DURATION_MINUTES = 15
const BOOSTER_2X_DURATION_MINUTES = 30

export type GoalReward = {
  goalId: string
  label: string
  gems: number
  boosterMultiplier?: number  // e.g., 1.5 or 2.0
  boosterDurationMinutes?: number
}

export type SubmitScoreResult =
  | {
      ok: true
      score: number
      accuracy: number
      completed: boolean
      totalXp: number
      xpGain: number
      gems: number
      goalsCompleted: GoalReward[]
    }
  | { ok: false; error: string }

// Anti-cheat: durasi main minimal & laju match maksimal yang masih manusiawi.
// Game 60 detik dengan lock 600ms per salah → attempts fisik ≤ ~200; cap 500
// memberi ruang lega tapi menutup nilai absurd.
const MIN_PLAY_MS = 8_000
const MAX_MATCHES_PER_SECOND = 2.5
const MAX_ATTEMPTS = 500
const SUBMIT_THROTTLE_MS = 15_000

export async function submitScore(
  lessonId: string,
  correctCount: number,
  attempts: number,
  startToken: string,
): Promise<SubmitScoreResult> {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return { ok: false, error: 'Harus login dulu' }

  // Run weekly league reset check
  await checkAndResetWeeklyLeagueGlobal()

  if (
    typeof lessonId !== 'string' ||
    typeof startToken !== 'string' ||
    !Number.isInteger(correctCount) ||
    !Number.isInteger(attempts) ||
    correctCount < 0 ||
    attempts < correctCount ||
    attempts > MAX_ATTEMPTS
  ) {
    return { ok: false, error: 'Input tidak valid' }
  }

  // Token bukti-mulai: skor hanya diterima dari sesi game yang benar-benar
  // dirender server (bukan panggilan action langsung), setelah durasi main
  // yang masuk akal, dengan laju match yang manusiawi.
  const tokenCheck = verifyGameToken(startToken, sessionUser.id, lessonId)
  if (!tokenCheck.ok) return { ok: false, error: 'Sesi game tidak valid — muat ulang halaman' }
  if (tokenCheck.elapsedMs < MIN_PLAY_MS) {
    return { ok: false, error: 'Sesi game terlalu singkat' }
  }
  if (correctCount > (tokenCheck.elapsedMs / 1000) * MAX_MATCHES_PER_SECOND) {
    return { ok: false, error: 'Skor tidak wajar' }
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
        gems: true,
        streakFreezes: true,
        boosterMultiplier: true,
        boosterExpiry: true,
      },
    }),
  ])

  // Skor dihitung di server dari jumlah benar/percobaan — nilai skor
  // mentah dari client tidak pernah dipercaya.
  const completed = totalMatches > 0 && correctCount === totalMatches
  const { score, accuracy } = computeScore(correctCount, attempts, totalMatches, completed)

  // Throttle antar-submit: satu ronde penuh butuh puluhan detik, jadi dua
  // submit untuk lesson yang sama dalam <15 detik pasti bukan permainan asli.
  if (existing && Date.now() - new Date(existing.updatedAt).getTime() < SUBMIT_THROTTLE_MS) {
    return { ok: false, error: 'Terlalu cepat — selesaikan ronde dulu' }
  }

  // Replay = lesson ini sudah pernah completed SEBELUM run ini. XP yang masuk
  // ke total user dipotong jadi 1/4; skor & histori lessonProgress tetap penuh.
  const isReplay = existing?.completed ?? false
  const baseXpGain = isReplay ? Math.round(score * REPLAY_XP_FACTOR) : score

  // Cek booster aktif — jika boosterExpiry ada dan belum kedaluwarsa, kalikan XP
  const now = new Date()
  const boosterActive =
    dbUser.boosterExpiry !== null &&
    dbUser.boosterMultiplier > 1.0 &&
    new Date(dbUser.boosterExpiry) > now
  const xpGain = boosterActive
    ? Math.round(baseXpGain * dbUser.boosterMultiplier)
    : baseXpGain

  // Skor & akurasi tersimpan mengikuti run dengan skor terbaik.
  const improved = score > (existing?.score ?? -1)

  // Streak bertambah saat user mendapatkan XP dari lesson (xpGain > 0).
  // Ini termasuk sesi tidak sempurna (waktu habis, ada salah) — yang penting
  // user sudah sungguh-sungguh belajar. Freeze auto-pakai saat ada hari bolong.
  const streakActive = xpGain > 0
  const { streak: newStreak, freezesUsed } = streakActive
    ? nextStreakWithFreeze(dbUser.streak, dbUser.lastActivityDate, now, dbUser.streakFreezes)
    : { streak: dbUser.streak, freezesUsed: 0 }

  const streakUpdate = streakActive
    ? {
        streak: newStreak,
        longestStreak: Math.max(dbUser.longestStreak, newStreak),
        lastActivityDate: wibDateOnly(now),
      }
    : {}

  // Hitung xpToday: reset jika hari baru (UTC), tambah jika hari sama.
  // xpGain (bukan score mentah) yang dihitung — supaya replay ×1/4 juga
  // tercermin di goal harian, bukan cuma total XP.
  const today = wibDateOnly(now)
  const isNewXpDay =
    !dbUser.lastXpDate ||
    wibDateOnly(new Date(dbUser.lastXpDate)).getTime() !== today.getTime()
  const xpTodayBefore = isNewXpDay ? 0 : dbUser.xpToday
  const xpTodayUpdate = isNewXpDay
    ? { xpToday: xpGain, lastXpDate: today }
    : { xpToday: { increment: xpGain }, lastXpDate: today }

  // Lesson "sempurna" = selesai dengan akurasi 100% (tanpa satu pun salah).
  // perfectToday reset tiap hari baru (UTC), sama seperti xpToday.
  const isPerfect = completed && accuracy === 1
  const isNewPerfectDay =
    !dbUser.lastPerfectDate ||
    wibDateOnly(new Date(dbUser.lastPerfectDate)).getTime() !== today.getTime()
  const perfectTodayBefore = isNewPerfectDay ? 0 : dbUser.perfectToday
  const perfectTodayUpdate = isPerfect
    ? isNewPerfectDay
      ? { perfectToday: 1, lastPerfectDate: today }
      : { perfectToday: { increment: 1 }, lastPerfectDate: today }
    : {}

  // Lesson done today (before this run)
  const lessonDoneTodayBefore = dbUser.lastActivityDate
    ? wibDateOnly(new Date(dbUser.lastActivityDate)).getTime() === today.getTime()
      ? 1
      : 0
    : 0

  // ── Cek transisi Daily Goals (sebelum vs sesudah) ──
  const goalsCompleted: GoalReward[] = []
  let gemsToAdd = 0
  let newBoosterMultiplier: number | null = null
  let newBoosterExpiry: Date | null = null

  // Goal 1: Selesaikan 1 lesson (transisi 0 → 1 hari ini)
  const lessonDoneTodayAfter = streakActive ? 1 : lessonDoneTodayBefore
  if (lessonDoneTodayBefore === 0 && lessonDoneTodayAfter === 1) {
    const reward: GoalReward = {
      goalId: 'daily-lesson',
      // Label mengikuti logika sebenarnya (streakActive = dapat XP hari ini,
      // tak harus sempurna) — jangan menjanjikan "selesaikan" bila tidak dicek.
      label: 'Belajar 1 Sesi Hari Ini',
      gems: 10,
      boosterMultiplier: 1.5,
      boosterDurationMinutes: BOOSTER_1_5X_DURATION_MINUTES,
    }
    goalsCompleted.push(reward)
    gemsToAdd += reward.gems
    // Hanya perbarui booster jika tidak ada booster lebih kuat yang aktif
    if (!boosterActive || dbUser.boosterMultiplier < 1.5) {
      newBoosterMultiplier = 1.5
      newBoosterExpiry = new Date(now.getTime() + BOOSTER_1_5X_DURATION_MINUTES * 60_000)
    }
  }

  // Goal 2: Raih 50 XP hari ini (transisi < 50 → >= 50)
  const XP_GOAL = 50
  const xpTodayAfter = xpTodayBefore + xpGain
  if (xpTodayBefore < XP_GOAL && xpTodayAfter >= XP_GOAL) {
    const reward: GoalReward = {
      goalId: 'daily-xp',
      label: 'Raih 50 XP Hari Ini',
      gems: 20,
      boosterMultiplier: 2.0,
      boosterDurationMinutes: BOOSTER_2X_DURATION_MINUTES,
    }
    goalsCompleted.push(reward)
    gemsToAdd += reward.gems
    // Booster 2x selalu menang atas 1.5x
    newBoosterMultiplier = 2.0
    newBoosterExpiry = new Date(now.getTime() + BOOSTER_2X_DURATION_MINUTES * 60_000)
  }

  // Goal 3: Selesaikan 3 lesson sempurna (transisi < 3 → >= 3)
  const PERFECT_GOAL = 3
  const perfectTodayAfter = perfectTodayBefore + (isPerfect ? 1 : 0)
  if (perfectTodayBefore < PERFECT_GOAL && perfectTodayAfter >= PERFECT_GOAL) {
    const reward: GoalReward = {
      goalId: 'daily-perfect',
      label: 'Selesaikan 3 Lesson Sempurna',
      gems: 50,
    }
    goalsCompleted.push(reward)
    gemsToAdd += reward.gems
  }

  // ── Drop Streak Freeze (10%) saat SEMUA goal harian selesai ──
  // Freeze langka: hanya bisa jatuh di run yang MELENGKAPI goal terakhir
  // (transisi "belum semua selesai" → "semua selesai"), peluang 10%, cap 3.
  const allGoalsBefore =
    lessonDoneTodayBefore >= 1 && xpTodayBefore >= XP_GOAL && perfectTodayBefore >= PERFECT_GOAL
  const allGoalsAfter =
    lessonDoneTodayAfter >= 1 && xpTodayAfter >= XP_GOAL && perfectTodayAfter >= PERFECT_GOAL

  const FREEZE_DROP_CHANCE = 0.1
  const MAX_FREEZES = 3
  const freezesAfterConsume = dbUser.streakFreezes - freezesUsed
  let freezeDropped = false
  if (!allGoalsBefore && allGoalsAfter && freezesAfterConsume < MAX_FREEZES) {
    if (Math.random() < FREEZE_DROP_CHANCE) {
      freezeDropped = true
    }
  }

  // Build booster update (hanya jika ada booster baru yang lebih baik)
  const boosterUpdate =
    newBoosterMultiplier !== null && newBoosterExpiry !== null
      ? { boosterMultiplier: newBoosterMultiplier, boosterExpiry: newBoosterExpiry }
      : {}

  // Freeze final = nilai absolut setelah konsumsi (bolong) & drop, di-cap ke
  // MAX_FREEZES. Nilai absolut (bukan increment/decrement) agar cap terjamin.
  const freezeNet = dbUser.streakFreezes - freezesUsed + (freezeDropped ? 1 : 0)
  const freezeFinal = Math.min(MAX_FREEZES, Math.max(0, freezeNet))
  const freezeUpdate =
    freezeFinal !== dbUser.streakFreezes ? { streakFreezes: freezeFinal } : {}

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
        gems: { increment: gemsToAdd },
        ...streakUpdate,
        ...freezeUpdate,
        ...xpTodayUpdate,
        ...perfectTodayUpdate,
        ...boosterUpdate,
      },
    }),
  ])

  // Segarkan seluruh tree layout supaya stats bar di header (streak/XP/level)
  // ikut ter-update dalam respons action yang sama, tanpa hard refresh.
  revalidatePath('/', 'layout')

  return {
    ok: true,
    score,
    accuracy,
    completed,
    totalXp: updatedUser.xp,
    xpGain,
    gems: updatedUser.gems,
    goalsCompleted,
  }
}
