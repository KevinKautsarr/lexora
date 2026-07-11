// Logika streak murni, berbasis hari WIB (UTC+7).
//
// Basis user LEXORA adalah Indonesia (WIB), jadi batas "hari" dihitung di
// UTC+7, bukan UTC. Dengan begitu user yang belajar jam 06.00 pagi WIB
// tercatat di hari yang sama secara intuitif (bukan "kemarin" versi UTC).
//
// Representasi kanonis: wibDateOnly menggeser waktu +7 jam lalu memotong ke
// midnight, mengembalikan Date yang secara nilai adalah "midnight UTC" namun
// MEWAKILI midnight WIB. Aman selama SEMUA baca/tulis tanggal streak/goal
// konsisten memakai fungsi ini (jangan bandingkan hasilnya dengan Date mentah).
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

/** Potong ke tengah malam WIB — representasi kanonis satu "hari". */
export function wibDateOnly(date: Date): Date {
  const wib = new Date(date.getTime() + WIB_OFFSET_MS)
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()))
}

function diffInDays(from: Date, to: Date): number {
  return Math.round((wibDateOnly(to).getTime() - wibDateOnly(from).getTime()) / 86_400_000)
}

/**
 * Streak baru setelah user menyelesaikan lesson pada `now`.
 * - Hari yang sama dengan aktivitas terakhir → streak tetap.
 * - Tepat sehari setelahnya → streak + 1.
 * - Lebih dari sehari (bolong) atau belum pernah → mulai dari 1.
 */
export function nextStreak(
  currentStreak: number,
  lastActivityDate: Date | null,
  now: Date,
): number {
  if (!lastActivityDate) return 1
  const diff = diffInDays(lastActivityDate, now)
  if (diff <= 0) return Math.max(currentStreak, 1)
  if (diff === 1) return currentStreak + 1
  return 1
}

/**
 * Streak baru dengan mempertimbangkan streak freeze (auto-pakai saat bolong).
 * Tiap hari yang terlewat (bolong) memakai 1 freeze untuk menambal streak.
 * - Bila freeze cukup menutup semua hari bolong → streak LANJUT (tidak reset),
 *   dan bertambah +1 untuk hari aktif sekarang.
 * - Bila freeze tidak cukup → streak reset ke 1, freeze tidak terpakai (sia-sia
 *   dipakai sebagian tidak menyelamatkan, jadi disimpan).
 *
 * @returns { streak, freezesUsed } — freezesUsed = berapa freeze yang dikonsumsi.
 */
export function nextStreakWithFreeze(
  currentStreak: number,
  lastActivityDate: Date | null,
  now: Date,
  freezesAvailable: number,
): { streak: number; freezesUsed: number } {
  if (!lastActivityDate) return { streak: 1, freezesUsed: 0 }
  const diff = diffInDays(lastActivityDate, now)
  // Hari yang sama → tetap; tepat kemarin → +1. Tidak butuh freeze.
  if (diff <= 0) return { streak: Math.max(currentStreak, 1), freezesUsed: 0 }
  if (diff === 1) return { streak: currentStreak + 1, freezesUsed: 0 }

  // Bolong: jumlah hari terlewat = diff - 1 (mis. diff 2 = bolong 1 hari).
  const daysMissed = diff - 1
  if (freezesAvailable >= daysMissed) {
    // Freeze menutup semua hari bolong → streak selamat & lanjut +1.
    return { streak: currentStreak + 1, freezesUsed: daysMissed }
  }
  // Tidak cukup freeze → streak putus, mulai dari 1 (freeze tak terpakai).
  return { streak: 1, freezesUsed: 0 }
}

/** Apakah daily goal (≥1 lesson selesai) sudah tercapai hari ini? */
export function isGoalMetToday(lastActivityDate: Date | null, now: Date): boolean {
  if (!lastActivityDate) return false
  return wibDateOnly(lastActivityDate).getTime() === wibDateOnly(now).getTime()
}
