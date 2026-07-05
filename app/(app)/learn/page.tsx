import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { computeUnlockedLessonIds } from '@/lib/progress'
import { getSessionUser } from '@/lib/session'
import JourneyPath, { type UnitSection } from '@/components/JourneyPath'
import DailyGoalsCard from '@/components/learn/DailyGoalsCard'
import StreakCard from '@/components/learn/StreakCard'
import NextLessonCard from '@/components/learn/NextLessonCard'

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const { notice } = await searchParams

  const [units, user] = await Promise.all([
    prisma.unit.findMany({
      orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' } } },
    }),
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        lessonProgress: {
          where: { completed: true },
          select: { lessonId: true, score: true },
        },
      },
    }),
  ])

  // Map lessonId → best score
  const bestScoreMap = new Map<string, number | null>()
  for (const p of user?.lessonProgress ?? []) {
    bestScoreMap.set(p.lessonId, p.score ?? null)
  }

  const completedIds = new Set(user?.lessonProgress.map((p) => p.lessonId) ?? [])

  const lessonRefs = units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({
      id: lesson.id,
      order: lesson.order,
      unitOrder: unit.order,
    })),
  )
  const unlockedIds = computeUnlockedLessonIds(lessonRefs, completedIds)

  // Find the "frontmost" lesson: first unlocked + not completed (in global sort order)
  const sortedRefs = [...lessonRefs].sort(
    (a, b) => a.unitOrder - b.unitOrder || a.order - b.order,
  )
  const frontmostId =
    sortedRefs.find((l) => unlockedIds.has(l.id) && !completedIds.has(l.id))?.id ?? null

  // Build UnitSection[] for JourneyPath
  const unitSections: UnitSection[] = units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    order: unit.order,
    lessons: unit.lessons.map((lesson, idx) => {
      const completed = completedIds.has(lesson.id)
      const unlocked = unlockedIds.has(lesson.id)
      return {
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        status: completed ? 'completed' : unlocked ? 'unlocked' : 'locked',
        bestScore: bestScoreMap.get(lesson.id) ?? null,
        isFrontmost: lesson.id === frontmostId,
        isLastInUnit: idx === unit.lessons.length - 1,
      }
    }),
  }))

  return (
    <div className="flex gap-6 lg:gap-8">
      {/* ─── Main: Journey Path ─── */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {notice === 'practice-empty' && (
          <p className="rounded-xl border border-amber-800 bg-amber-950/30 px-4 py-3 text-sm font-medium text-amber-300">
            Mode Practice terbuka setelah kamu menyelesaikan minimal 1 lesson —
            mulai dari lesson pertama di bawah!
          </p>
        )}
        <header>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            Journey
          </h1>
          <p className="text-sm text-zinc-400">
            Halo,{' '}
            <span className="font-semibold text-zinc-200">
              {user?.name ?? sessionUser.email}
            </span>{' '}
            — lanjutkan petualanganmu!
          </p>
        </header>

        <JourneyPath units={unitSections} />
      </div>

      {/* ─── Right Sidebar (hidden < lg) ─── */}
      <aside className="hidden w-72 flex-shrink-0 lg:flex lg:flex-col lg:gap-4">
        <Suspense fallback={<SidebarCardSkeleton />}>
          <NextLessonCard />
        </Suspense>
        <Suspense fallback={<SidebarCardSkeleton />}>
          <DailyGoalsCard />
        </Suspense>
        <Suspense fallback={<SidebarCardSkeleton />}>
          <StreakCard />
        </Suspense>
      </aside>
    </div>
  )
}

// Lightweight skeleton while cards load
function SidebarCardSkeleton() {
  return (
    <div className="h-32 animate-pulse rounded-xl border border-zinc-700/40 bg-zinc-800/40" />
  )
}
