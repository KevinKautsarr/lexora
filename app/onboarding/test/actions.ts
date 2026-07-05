'use server'

import {
  gradePlacement,
  recommendLevelOrder,
  PLACEMENT_FROM_BELOW,
  PLACEMENT_FROM_TARGET,
  PLACEMENT_OPTIONS_PER_QUESTION,
  PLACEMENT_SESSION_FRESH_MINUTES,
} from '@/lib/placement'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export type PlacementQuestion = { prompt: string; options: string[] }

export type StartPlacementResult =
  | { ok: true; sessionId: string; questions: PlacementQuestion[] }
  | { ok: false; error: string }

export type SubmitPlacementResult =
  | {
      ok: true
      score: number
      total: number
      passed: boolean
      targetLevelOrder: number
      recommendation: { levelOrder: number; label: string } | null
    }
  | { ok: false; error: string }

export type AcceptRecommendationResult = { ok: true } | { ok: false; error: string }

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

type WordRow = { id: string; term: string; translation: string; levelOrder: number }

async function fetchLevelWords(levelOrders: number[]): Promise<WordRow[]> {
  const words = await prisma.word.findMany({
    where: { lesson: { unit: { level: { order: { in: levelOrders } } } } },
    select: {
      id: true,
      term: true,
      translation: true,
      lesson: { select: { unit: { select: { level: { select: { order: true } } } } } },
    },
  })
  return words.map((w) => ({
    id: w.id,
    term: w.term,
    translation: w.translation,
    levelOrder: w.lesson.unit.level.order,
  }))
}

// Bangun soal dari kata-kata terpilih: prompt bahasa Indonesia + 4 pilihan
// bahasa Inggris (1 benar + 3 pengecoh dari level yang sama), tanpa penanda.
function buildQuestions(questionWords: WordRow[], pool: WordRow[]): PlacementQuestion[] {
  return questionWords.map((word) => {
    const distractors = shuffle(
      pool.filter((w) => w.levelOrder === word.levelOrder && w.term !== word.term),
    )
      .slice(0, PLACEMENT_OPTIONS_PER_QUESTION - 1)
      .map((w) => w.term)
    return {
      prompt: word.translation,
      options: shuffle([word.term, ...distractors]),
    }
  })
}

async function requireNotOnboardedUser() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) return null
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, onboarded: true },
  })
  if (!user || user.onboarded) return null
  return user
}

export async function startPlacement(targetLevelOrder: number): Promise<StartPlacementResult> {
  const user = await requireNotOnboardedUser()
  if (!user) return { ok: false, error: 'Sesi tidak valid atau sudah onboarding' }

  if (!Number.isInteger(targetLevelOrder)) return { ok: false, error: 'Level tidak valid' }
  const [level, lowest] = await Promise.all([
    prisma.level.findUnique({ where: { order: targetLevelOrder } }),
    prisma.level.findFirstOrThrow({ orderBy: { order: 'asc' }, select: { order: true } }),
  ])
  if (!level || level.order <= lowest.order) return { ok: false, error: 'Level tidak valid' }

  const pool = await fetchLevelWords([targetLevelOrder, targetLevelOrder - 1])
  const targetWords = pool.filter((w) => w.levelOrder === targetLevelOrder)
  const belowWords = pool.filter((w) => w.levelOrder === targetLevelOrder - 1)
  if (
    targetWords.length < PLACEMENT_FROM_TARGET + PLACEMENT_OPTIONS_PER_QUESTION ||
    belowWords.length < PLACEMENT_FROM_BELOW + PLACEMENT_OPTIONS_PER_QUESTION
  ) {
    return { ok: false, error: 'Kosakata level ini belum cukup untuk tes' }
  }

  // Anti re-roll: sesi belum dinilai yang masih segar dipakai ulang, bukan
  // dibuatkan soal baru — menembak startPlacement berulang tidak mengganti soal.
  const freshSince = new Date(Date.now() - PLACEMENT_SESSION_FRESH_MINUTES * 60_000)
  const existing = await prisma.placementSession.findFirst({
    where: {
      userId: user.id,
      targetLevelOrder,
      answeredAt: null,
      createdAt: { gte: freshSince },
    },
    orderBy: { createdAt: 'desc' },
  })

  let sessionId: string
  let questionWords: WordRow[]

  if (existing) {
    sessionId = existing.id
    const ids = existing.questionWordIds as string[]
    const byId = new Map(pool.map((w) => [w.id, w]))
    questionWords = ids.map((id) => byId.get(id)!).filter(Boolean)
  } else {
    questionWords = [
      ...shuffle(targetWords).slice(0, PLACEMENT_FROM_TARGET),
      ...shuffle(belowWords).slice(0, PLACEMENT_FROM_BELOW),
    ]
    const created = await prisma.placementSession.create({
      data: {
        userId: user.id,
        targetLevelOrder,
        questionWordIds: questionWords.map((w) => w.id),
      },
    })
    sessionId = created.id
  }

  return { ok: true, sessionId, questions: buildQuestions(questionWords, pool) }
}

export async function submitPlacement(
  sessionId: string,
  answers: (string | null)[],
): Promise<SubmitPlacementResult> {
  const user = await requireNotOnboardedUser()
  if (!user) return { ok: false, error: 'Sesi tidak valid atau sudah onboarding' }

  if (typeof sessionId !== 'string' || !Array.isArray(answers)) {
    return { ok: false, error: 'Input tidak valid' }
  }

  const placement = await prisma.placementSession.findUnique({ where: { id: sessionId } })
  if (!placement || placement.userId !== user.id) {
    return { ok: false, error: 'Sesi tes tidak ditemukan' }
  }
  if (placement.answeredAt !== null) {
    return { ok: false, error: 'Sesi tes ini sudah dinilai' }
  }

  const wordIds = placement.questionWordIds as string[]
  if (answers.length !== wordIds.length) {
    return { ok: false, error: 'Jumlah jawaban tidak sesuai jumlah soal' }
  }

  // Kunci jawaban diambil dari DB berdasarkan questionWordIds — jawaban
  // dinilai murni di server, urutan mengikuti urutan soal tersimpan.
  const words = await prisma.word.findMany({
    where: { id: { in: wordIds } },
    select: { id: true, term: true },
  })
  const termById = new Map(words.map((w) => [w.id, w.term]))
  const correctTerms = wordIds.map((id) => termById.get(id) ?? '')

  const { score, total, passed } = gradePlacement(correctTerms, answers)

  const lowest = await prisma.level.findFirstOrThrow({
    orderBy: { order: 'asc' },
    select: { order: true },
  })

  await prisma.$transaction([
    prisma.placementSession.update({
      where: { id: placement.id },
      data: { answeredAt: new Date(), score, passed },
    }),
    ...(passed
      ? [
          prisma.user.update({
            where: { id: user.id },
            data: { startLevelOrder: placement.targetLevelOrder, onboarded: true },
          }),
        ]
      : []),
  ])

  let recommendation: { levelOrder: number; label: string } | null = null
  if (!passed) {
    const recommendedOrder = recommendLevelOrder(
      score,
      placement.targetLevelOrder,
      lowest.order,
    )
    const recommended = await prisma.level.findUnique({ where: { order: recommendedOrder } })
    recommendation = recommended
      ? { levelOrder: recommended.order, label: `${recommended.name} (${recommended.code})` }
      : null
  }

  return {
    ok: true,
    score,
    total,
    passed,
    targetLevelOrder: placement.targetLevelOrder,
    recommendation,
  }
}

export async function acceptRecommendation(
  sessionId: string,
): Promise<AcceptRecommendationResult> {
  const user = await requireNotOnboardedUser()
  if (!user) return { ok: false, error: 'Sesi tidak valid atau sudah onboarding' }

  const placement = await prisma.placementSession.findUnique({ where: { id: sessionId } })
  if (!placement || placement.userId !== user.id) {
    return { ok: false, error: 'Sesi tes tidak ditemukan' }
  }
  if (placement.answeredAt === null || placement.passed !== false || placement.score === null) {
    return { ok: false, error: 'Rekomendasi hanya tersedia untuk tes yang sudah dinilai dan gagal' }
  }

  // Rekomendasi dihitung ulang di server dari skor tersimpan — klien tidak
  // pernah mengirim level tujuan.
  const lowest = await prisma.level.findFirstOrThrow({
    orderBy: { order: 'asc' },
    select: { order: true },
  })
  const recommendedOrder = recommendLevelOrder(
    placement.score,
    placement.targetLevelOrder,
    lowest.order,
  )

  await prisma.user.update({
    where: { id: user.id },
    data: { startLevelOrder: recommendedOrder, onboarded: true },
  })

  return { ok: true }
}
