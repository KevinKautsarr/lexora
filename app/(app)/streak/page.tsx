import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { levelForXp } from '@/lib/level'
import { getCurrentCefrLevel } from '@/lib/cefr'
import StreakPageClient from '@/components/streak/StreakPageClient'

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

// Format tanggal WIB (YYYY-MM-DD) — geser +7 jam lalu ambil komponen UTC,
// konsisten dengan wibDateOnly di lib/streak. Dipakai agar kalender streak
// menandai hari yang sama dengan batas hari WIB yang dipakai perhitungan streak.
function wibDateStr(date: Date): string {
  const d = new Date(date.getTime() + WIB_OFFSET_MS)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}


export const metadata = { title: 'Streak' }

export default async function StreakPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  const [user, progress, topStreaks] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: {
        xp: true,
        streak: true,
        longestStreak: true,
        lastActivityDate: true,
        startLevelOrder: true,
        division: true,
        streakFreezes: true,
      },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: sessionUser.id, completed: true },
      select: { updatedAt: true, accuracy: true },
    }),
    // Papan streak teratas — hanya user dengan streak berjalan (angka nol
    // tidak memotivasi siapa pun).
    prisma.user.findMany({
      where: { streak: { gt: 0 } },
      orderBy: [{ streak: 'desc' }, { longestStreak: 'desc' }],
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        streak: true,
        image: true,
      },
    }),
  ])

  const cefr = await getCurrentCefrLevel(sessionUser.id, user.startLevelOrder)
  const currentLevel = cefr ? cefr.code : `Tingkat ${levelForXp(user.xp)}`

  // Hitung Akurasi Rata-rata
  const completedWithAccuracy = progress.filter((p) => p.accuracy !== null)
  const avgAccuracy =
    completedWithAccuracy.length > 0
      ? completedWithAccuracy.reduce((sum, p) => sum + (p.accuracy ?? 0), 0) /
        completedWithAccuracy.length
      : 0

  // Format persentase sesuai regulasi lokal id-ID (contoh: 96,8%)
  const accuracyPercent =
    completedWithAccuracy.length > 0
      ? new Intl.NumberFormat('id-ID', {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(avgAccuracy)
      : 'Belum Ada'

  // Rekonstruksi semua tanggal keaktifan unik (format YYYY-MM-DD WIB)
  const activeDates = new Set<string>()

  // 1. Dari data LessonProgress
  progress.forEach((p) => {
    activeDates.add(wibDateStr(new Date(p.updatedAt)))
  })

  // 2. Dari rentang streak aktif saat ini.
  // lastActivityDate sudah berupa wibDateOnly (midnight UTC yang mewakili
  // midnight WIB), jadi mundur per 24 jam & format langsung sudah selaras WIB.
  if (user.streak > 0 && user.lastActivityDate) {
    const lastDate = new Date(user.lastActivityDate)
    for (let i = 0; i < user.streak; i++) {
      const d = new Date(lastDate.getTime() - i * 86_400_000)
      activeDates.add(wibDateStr(d))
    }
  }

  const completedDates = Array.from(activeDates)

  // Mapping model user ke tipe yang sesuai props client
  const clientUser = {
    xp: user.xp,
    streak: user.streak,
    longestStreak: user.longestStreak,
    lastActivityDate: user.lastActivityDate,
    startLevelOrder: user.startLevelOrder,
    division: user.division,
    streakFreezes: user.streakFreezes,
  }

  return (
    <div className="flex justify-center w-full min-h-screen py-4 px-1">
      <StreakPageClient
        currentUserId={sessionUser.id}
        user={clientUser}
        completedDates={completedDates}
        currentLevel={currentLevel}
        accuracyPercent={accuracyPercent}
        topStreaks={topStreaks}
      />
    </div>
  )
}
