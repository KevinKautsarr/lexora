import { prisma } from './prisma'

/**
 * Calculates the start of the week (Monday 00:00:00 UTC) for a given date.
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1) // Adjust if Sunday
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff, 0, 0, 0, 0))
  return monday
}

/**
 * Global Lazy Reset for the weekly division leaderboard.
 * Triggers exactly once per calendar week, during the first active request.
 */
export async function checkAndResetWeeklyLeagueGlobal() {
  const now = new Date()
  const currentWeekStart = getWeekStart(now)

  // Fast check: has anyone reset for this week yet?
  // If there's at least one user with lastWeekStart >= currentWeekStart, the reset has already occurred.
  const alreadyReset = await prisma.user.findFirst({
    where: {
      lastWeekStart: {
        gte: currentWeekStart,
      },
    },
  })

  if (alreadyReset) {
    // Reset has already run for this week
    return
  }

  // Fetch all users to calculate promotion, demotion, and win rewards.
  // CATATAN SKALA: select sudah minimal (3 field kecil), tapi tetap memuat
  // seluruh user ke memori — masih aman sampai puluhan ribu user (~beberapa
  // MB). Di atas itu, ranking perlu dipindah ke SQL (window function
  // ROW_NUMBER() OVER (PARTITION BY division ORDER BY xpThisWeek DESC)).
  const users = await prisma.user.findMany({
    select: { id: true, division: true, xpThisWeek: true },
  })

  if (users.length === 0) return

  // Group and sort users by division and weekly XP (descending)
  const bronzeUsers = users
    .filter((u) => u.division === 'BRONZE')
    .sort((a, b) => b.xpThisWeek - a.xpThisWeek)

  const silverUsers = users
    .filter((u) => u.division === 'SILVER')
    .sort((a, b) => b.xpThisWeek - a.xpThisWeek)

  const goldUsers = users
    .filter((u) => u.division === 'GOLD')
    .sort((a, b) => b.xpThisWeek - a.xpThisWeek)

  // Kelompokkan user per transisi (divisi-lama → divisi-baru, menang emas
  // atau tidak) lalu eksekusi dengan updateMany per kelompok — maksimal ~7
  // query berapa pun jumlah user, bukan 1 query update per user.
  type Bucket = { division: string; newDiv: string; wonGold: boolean; ids: string[] }
  const buckets = new Map<string, Bucket>()

  for (const u of users) {
    let newDiv = u.division
    let wonGold = false

    if (u.division === 'BRONZE') {
      const rank = bronzeUsers.findIndex((x) => x.id === u.id)
      // Top 3 with positive XP get promoted
      if (rank !== -1 && rank < 3 && u.xpThisWeek > 0) {
        newDiv = 'SILVER'
      }
    } else if (u.division === 'SILVER') {
      const rank = silverUsers.findIndex((x) => x.id === u.id)
      if (u.xpThisWeek === 0) {
        // Users with 0 XP get demoted
        newDiv = 'BRONZE'
      } else if (rank !== -1) {
        if (rank < 3) {
          // Top 3 get promoted
          newDiv = 'GOLD'
        } else {
          // Bottom 3 active users get demoted
          const activeSilver = silverUsers.filter((x) => x.xpThisWeek > 0)
          const activeRank = activeSilver.findIndex((x) => x.id === u.id)
          if (activeRank !== -1 && activeRank >= activeSilver.length - 3) {
            newDiv = 'BRONZE'
          }
        }
      }
    } else if (u.division === 'GOLD') {
      const rank = goldUsers.findIndex((x) => x.id === u.id)
      if (u.xpThisWeek === 0) {
        // 0 XP users demoted
        newDiv = 'SILVER'
      } else if (rank !== -1) {
        if (rank < 3) {
          // Top 3 win and stay in Gold
          newDiv = 'GOLD'
          wonGold = true
        } else {
          // Bottom 3 active users get demoted
          const activeGold = goldUsers.filter((x) => x.xpThisWeek > 0)
          const activeRank = activeGold.findIndex((x) => x.id === u.id)
          if (activeRank !== -1 && activeRank >= activeGold.length - 3) {
            newDiv = 'SILVER'
          }
        }
      }
    }

    const key = `${u.division}|${newDiv}|${wonGold}`
    const bucket = buckets.get(key)
    if (bucket) bucket.ids.push(u.id)
    else buckets.set(key, { division: u.division, newDiv, wonGold, ids: [u.id] })
  }

  const updates = Array.from(buckets.values()).map((b) =>
    prisma.user.updateMany({
      where: { id: { in: b.ids } },
      data: {
        previousDivision: b.division, // Retain for notification popup
        division: b.newDiv,
        xpThisWeek: 0,
        lastWeekStart: currentWeekStart,
        ...(b.wonGold ? { goldWins: { increment: 1 } } : {}),
      },
    }),
  )

  // Execute reset transactionally
  await prisma.$transaction(updates)
}
