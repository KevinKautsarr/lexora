import { Lock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getLevelsWithUnits } from '@/lib/catalog'
import { prisma } from '@/lib/prisma'
import {
  computeUnlockedLessonIds,
  findNextLessonRef,
  type LessonOrderRef,
} from '@/lib/progress'
import { getSessionUser } from '@/lib/session'
import JourneyPath, { type UnitSection } from '@/components/JourneyPath'
import ScrollToActiveLesson from '@/components/ScrollToActiveLesson'
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

  const [levels, user] = await Promise.all([
    getLevelsWithUnits(),
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

  const startLevelOrder = user?.startLevelOrder ?? 1

  // Map lessonId → best score
  const bestScoreMap = new Map<string, number | null>()
  for (const p of user?.lessonProgress ?? []) {
    bestScoreMap.set(p.lessonId, p.score ?? null)
  }

  const completedIds = new Set(user?.lessonProgress.map((p) => p.lessonId) ?? [])

  const lessonRefs: LessonOrderRef[] = levels.flatMap((level) =>
    level.units.flatMap((unit) =>
      unit.lessons.map((lesson) => ({
        id: lesson.id,
        order: lesson.order,
        unitOrder: unit.order,
        levelOrder: level.order,
      })),
    ),
  )
  const unlockedIds = computeUnlockedLessonIds(lessonRefs, completedIds, startLevelOrder)

  // Frontmost = lesson berikutnya pada rantai wajib (level >= startLevelOrder).
  const frontmost = findNextLessonRef(lessonRefs, completedIds, startLevelOrder)
  const activeLevelOrder = frontmost?.levelOrder ?? null

  return (
    <div className="flex gap-6 lg:gap-8">
      {/* Auto-scroll ke lesson yang sedang dikerjakan saat halaman dibuka. */}
      <ScrollToActiveLesson />
      {/* ─── Main: Journey Path per Level ─── */}
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        {notice === 'practice-empty' && (
          <p className="rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm font-medium text-amber-700">
            Mode Practice terbuka setelah kamu menyelesaikan minimal 1 lesson —
            mulai dari lesson pertama di bawah!
          </p>
        )}
        <header>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            Journey
          </h1>
          <p className="text-sm text-zinc-400 break-words">
            Halo,{' '}
            <span className="font-semibold text-zinc-200">
              {user?.name ?? sessionUser.email}
            </span>{' '}
            — lanjutkan petualanganmu!
          </p>
        </header>

        {levels.length === 0 && (
          <p className="rounded-2xl border border-zinc-800 bg-zinc-800/40 px-6 py-10 text-center text-sm text-zinc-400">
            Belum ada materi tersedia. Cek lagi sebentar lagi!
          </p>
        )}

        {levels.map((level) => {
          const isActive = level.order === activeLevelOrder
          const isFreelyOpen = level.order < startLevelOrder
          // Terkunci = belum ada satu pun lesson di level ini yang terbuka.
          // Level aktif & "terbuka bebas" selalu punya lesson unlocked → tidak locked.
          const isLocked = level.units.every((unit) =>
            unit.lessons.every((lesson) => !unlockedIds.has(lesson.id)),
          )

          const unitSections: UnitSection[] = level.units.map((unit) => ({
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
                isFrontmost: lesson.id === frontmost?.id,
                isLastInUnit: idx === unit.lessons.length - 1,
              }
            }),
          }))

          return (
            <section key={level.id} aria-label={`Tingkat ${level.code} — ${level.name}`}>
              <header
                aria-disabled={isLocked ? 'true' : undefined}
                className={`mb-4 rounded-2xl border px-5 py-4 ${
                  isActive
                    ? 'border-brand-600 bg-brand-100'
                    : isLocked
                      ? 'border-zinc-700 bg-zinc-800/30'
                      : 'border-zinc-800 bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm font-black ${
                      isActive
                        ? 'bg-brand-500 text-brand-950'
                        : isLocked
                          ? 'bg-zinc-700/60 text-zinc-400'
                          : 'bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    {isLocked && <Lock size={13} aria-hidden />}
                    {level.code}
                  </span>
                  <h2
                    className={`text-lg font-bold ${
                      isLocked ? 'text-zinc-400' : 'text-zinc-100'
                    }`}
                  >
                    {level.name}
                  </h2>
                  {isActive && (
                    <span className="ml-auto rounded-full bg-brand-500/15 px-3 py-1 text-xs font-bold text-brand-600">
                      Sedang ditempuh
                    </span>
                  )}
                  {isFreelyOpen && (
                    <span className="ml-auto rounded-full bg-zinc-700/60 px-3 py-1 text-xs font-semibold text-zinc-400">
                      Terbuka bebas
                    </span>
                  )}
                  {isLocked && (
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-zinc-700/40 px-3 py-1 text-xs font-semibold text-zinc-500">
                      <Lock size={11} aria-hidden />
                      Terkunci
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-sm ${isLocked ? 'text-zinc-500' : 'text-zinc-400'}`}
                >
                  {level.description}
                </p>
                {isLocked && (
                  <p className="mt-2 text-xs font-medium text-zinc-500">
                    Selesaikan tingkat sebelumnya untuk membuka {level.code}.
                  </p>
                )}
              </header>

              {/* Journey diredupkan saat level terkunci — semua node-nya locked. */}
              <div className={isLocked ? 'opacity-60' : undefined}>
                <JourneyPath units={unitSections} />
              </div>
            </section>
          )
        })}
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
