// Logika streak murni, berbasis hari UTC.
//
// KETERBATASAN TIMEZONE: "hari" dihitung dari tanggal UTC server, bukan
// timezone user. User di WIB (UTC+7) yang menyelesaikan lesson jam 06.00
// pagi masih dihitung sebagai "kemarin" versi UTC (23.00). Batas hari pun
// bergeser: streak bisa terasa reset/lanjut di jam yang tidak intuitif.
// Perbaikan yang benar: simpan timezone user dan hitung batas hari di
// timezone itu. Untuk sekarang UTC dipilih karena konsisten antar server
// dan tidak terpengaruh timezone mesin deploy.

/** Potong ke tengah malam UTC — representasi kanonis satu "hari". */
export function utcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function diffInDays(from: Date, to: Date): number {
  return Math.round((utcDateOnly(to).getTime() - utcDateOnly(from).getTime()) / 86_400_000)
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

/** Apakah daily goal (≥1 lesson selesai) sudah tercapai hari ini? */
export function isGoalMetToday(lastActivityDate: Date | null, now: Date): boolean {
  if (!lastActivityDate) return false
  return utcDateOnly(lastActivityDate).getTime() === utcDateOnly(now).getTime()
}
