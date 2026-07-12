import { Lock, Dumbbell } from 'lucide-react'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { Suspense } from 'react'
import Image from 'next/image'
import { getLevelsWithUnits } from '@/lib/catalog'
import { prisma } from '@/lib/prisma'
import {
  computeUnlockedLessonIds,
  findNextLessonRef,
  type LessonOrderRef,
} from '@/lib/progress'
import { getSessionUser } from '@/lib/session'
import { isGoalMetToday } from '@/lib/streak'
import JourneyPath, { type UnitSection } from '@/components/JourneyPath'
import ScrollToActiveLesson from '@/components/ScrollToActiveLesson'
import ScrollToggleButton from '@/components/ScrollToggleButton'
import UserStats from '@/components/UserStats'
import DailyGoalsCard from '@/components/learn/DailyGoalsCard'
import StreakCard from '@/components/learn/StreakCard'
import NextLessonCard from '@/components/learn/NextLessonCard'
import ReminderBanner from '@/components/learn/ReminderBanner'
import JourneyScenery from '@/components/JourneyScenery'
import EmptyState from '@/components/EmptyState'
import { checkAndResetWeeklyLeagueGlobal } from '@/lib/league'
import ResetNotification from '@/components/learn/ResetNotification'


export const metadata = { title: 'Journey' }

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>
}) {
  const sessionUser = await getSessionUser()

  if (!sessionUser) redirect('/login')

  // Reset liga mingguan dijalankan SETELAH respons terkirim (non-blocking) —
  // tidak menahan render halaman. Konsekuensi: pada request pertama tiap minggu,
  // popup promosi/degradasi (ResetNotification) baru muncul di kunjungan
  // berikutnya, karena previousDivision di-set oleh reset ini. Dapat diterima:
  // reset idempoten & hanya sekali per minggu.
  after(async () => {
    await checkAndResetWeeklyLeagueGlobal()
  })

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

  // Pengingat belajar: tampil jika reminder aktif, punya streak berjalan, dan
  // belum belajar hari ini (streak berisiko putus). Syarat waktu (sudah lewat
  // jam) dicek di client karena butuh waktu lokal.
  const showReminder =
    !!user?.reminderEnabled &&
    (user?.streak ?? 0) > 0 &&
    !isGoalMetToday(user?.lastActivityDate ?? null, new Date())

  return (
    // items-start supaya aside kanan bisa sticky (bukan di-stretch penuh).
    <div className="flex items-start gap-6 lg:gap-8 relative">
      {user?.previousDivision && (
        <ResetNotification
          previousDivision={user.previousDivision}
          currentDivision={user.division}
        />
      )}
      {/* Auto-scroll ke lesson yang sedang dikerjakan saat halaman dibuka. */}
      <ScrollToActiveLesson />
      {/* Tombol melayang untuk scroll ke pelajaran aktif (fixed positioning). */}
      <ScrollToggleButton />
      {/* ─── Main: Journey Path per Level ─── */}
      <div className="flex min-w-0 flex-1 flex-col gap-10">
        {showReminder && user && (
          <ReminderBanner reminderHour={user.reminderHour} streak={user.streak} />
        )}
        {notice === 'practice-empty' && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-2xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-200"
          >
            <Dumbbell size={18} className="shrink-0 text-brand-400" aria-hidden />
            Latihan Personal butuh minimal satu lesson yang sudah selesai.
            Selesaikan lesson pertamamu di bawah ini, lalu coba lagi!
          </div>
        )}
        <header>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-zinc-100">
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
          <EmptyState
            pose="reading"
            title="Belum ada materi tersedia"
            description="Lexi sedang menyiapkan pelajaran baru. Cek lagi sebentar lagi!"
          />
        )}

        {/* Wrapper relatif untuk latar dekoratif biophilic (di belakang node). */}
        <div className="relative">
          <JourneyScenery />
          <div className="relative z-10 flex flex-col gap-10">
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
        </div>

        {/* End of Journey CTA Banner */}
        <div className="mt-6 relative overflow-hidden rounded-3xl border border-zinc-700 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 10% 20%, #fff 0%, transparent 40%)',
            }}
          />
          <div className="flex flex-col gap-2 text-center sm:text-left z-10">
            <span className="w-max mx-auto sm:mx-0 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-brand-500">
              Target Berikutnya
            </span>
            <h2 className="text-xl font-black text-zinc-100">Siap Naik ke Level Selanjutnya?</h2>
            <p className="text-sm text-zinc-400 max-w-md text-pretty">
              Kumpulkan lebih banyak XP dari lesson dan raih pencapaian baru hari ini! Selesaikan target harian untuk membuka peti hadiah.
            </p>
          </div>
          <div className="relative h-28 w-44 shrink-0 z-10 select-none">
            <Image
              src="/images/14_footer_cta_gamified-1.png"
              alt="Hadiah Gamifikasi"
              fill
              sizes="176px"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* ─── Right Sidebar (hidden < lg) — sticky supaya tetap saat scroll.
          max-h + overflow-y-auto: kalau kartunya lebih tinggi dari layar,
          sidebar scroll sendiri (tidak terpotong di atas). Scrollbar sidebar
          disembunyikan agar rapi. ─── */}
      <aside className="hidden w-72 flex-shrink-0 lg:sticky lg:top-8 lg:flex lg:max-h-[calc(100vh-4rem)] lg:flex-col lg:gap-4 lg:overflow-y-auto lg:pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Suspense fallback={<SidebarCardSkeleton />}>
          <div className="shrink-0">
            <StreakCard />
          </div>
        </Suspense>
        <Suspense fallback={<SidebarCardSkeleton />}>
          <div className="shrink-0">
            <UserStats />
          </div>
        </Suspense>
        <Suspense fallback={<SidebarCardSkeleton />}>
          <div className="shrink-0">
            <NextLessonCard />
          </div>
        </Suspense>
        <Suspense fallback={<SidebarCardSkeleton />}>
          <div className="shrink-0">
            <DailyGoalsCard />
          </div>
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
